import { getServerCollection } from "./getServerCollection";
import { signal, type WritableSignal } from "@angular/core";
import { ServerPojo } from "./ObjectsPool";
import { PoolFactory } from "./PoolFactory";

export interface ClassMeta {
  collectionName: string;
}

/**
 * This is defined by the user
 */
export interface PropertyMeta {
  /**
   * What the default value is when the object is first created and registered.
   */
  init?: any;
  /**
   * Specifies the client-side access level for this property.
   * Default: readwrite
   */
  client?: "readonly" | "hidden" | "readwrite";
}

const symMeta = Symbol("mso.metaData"); //Used when we want to attach MSO-specific metadata to a class/object.
const symProperties = Symbol("mso.properties");
export default abstract class MsoObject {
  /**
   * @decorator
   */
  public static Meta(meta: ClassMeta) {
    return function (constructor: new () => MsoObject) {
      (constructor as any)[symMeta] = meta;
    };
  }
  /**
   * @decorator
   */
  public static Property(meta?: PropertyMeta) {
    meta ??= {};
    meta.client ??= "readwrite";
    return function (prototype: MsoObject, propertyKey: string) {
      prototype[symProperties] ??= {};
      prototype[symProperties][propertyKey] = meta;
      Object.defineProperty(prototype, propertyKey, {
        set(this: MsoObject, v) {
          const signal = this.propertySignals[propertyKey];
          let oldValue = signal();
          if (v !== oldValue) {
            if (!this.isUpdating) {
              this.lastUserPropertySetAt[propertyKey] = Date.now();
            }
            signal.set(v);
            this.onPropertyChange(propertyKey, v, oldValue);
          }
        },
        get(this: MsoObject) {
          const signal = this.propertySignals[propertyKey];
          let value = signal();
          if (value === undefined) {
            if (!this.registered) {
              return prototype[symProperties][propertyKey].init;
            }
            throw new Error(
              `Property ${propertyKey} is not available. This means it hasn't been sent to the client via your subscription.`,
            );
          }
          return value;
        },
        enumerable: true,
        configurable: true,
      });
    };
  }
  public static getClazzMeta(clazz: new () => MsoObject): ClassMeta {
    return (clazz as any)[symMeta];
  }
  constructor() {
    if (!(this.constructor as any)[symMeta]) {
      throw new Error(
        `Class metadata is not defined for ${this.constructor.name}. Did you forget to add the @MsoObject.Meta decorator?`,
      );
    }
    for (let property in this[symProperties]) {
      this.propertySignals[property] = signal(undefined);
    }
  }
  /**
   * Whether it's updating with data from the server
   */
  private isUpdating = false;
  private registering = false;
  private registered = false;
  public _id!: string;
  private propertySignals: Record<string, WritableSignal<any>> = {};
  private lastUserPropertySetAt: Record<string, number> = {};
  private queuedServerPropertyUpdates: Record<
    string,
    { value: any; timer: ReturnType<typeof setTimeout> }
  > = {};
  private deleted = false;
  /**
   * Defined on the prototype
   */
  declare [symProperties]: Record<string, PropertyMeta>;

  /**
   * Internal use only. Do not call manually.
   * @param source
   */
  public update(source: ServerPojo): void {
    this.registered = true;
    this.isUpdating = true;
    try {
      for (let prop in source) {
        this.setPropertyFromServer(prop, (source as any)[prop]);
      }
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Call this method on a new instance that you're created on the client to register it on the server.
   */
  async register(): Promise<void> {
    if (this._id) {
      throw new Error(`Object is already registered with _id ${this._id}`);
    }
    if (this.registering) {
      throw new Error(`Object is already in the process of registering.`);
    }
    this.registering = true;
    try {
      this.copyInitValues();
      await PoolFactory.instance
        .getPool(this.constructor as new () => MsoObject)
        .insert(this);
      this.registered = true;
    } finally {
      this.registering = false;
    }
  }

  /**
   * Deletes the object from the server.
   */
  async delete() {
    if (!this._id) {
      throw new Error(`Object is not registered.`);
    }
    if (this.deleted) {
      throw new Error(`Object is already deleted.`);
    }
    this.deleted = true;
    return await PoolFactory.instance
      .getPool(this.constructor as new () => MsoObject)
      .delete(this);
  }

  private onPropertyChange(propertyKey: string, value: any, oldValue: any) {
    if (this.isUpdating) {
      return;
    }
    if (this.registering) {
      throw new Error(`Object is currently in the process of registering.`);
    }
    if (!this._id) {
      //not registered yet, ignore
      return;
    }
    if (this.deleted) {
      throw new Error(`Cannot change properties on a deleted object.`);
    }
    let meta = MsoObject.getClazzMeta(this.constructor as new () => MsoObject);
    if (Meteor.isClient) {
      if (this[symProperties][propertyKey]?.client !== "readwrite") {
        throw new Error(`Cannot change readonly property '${propertyKey}'.`);
      }
    }
    if (Meteor.isServer) {
      const collection = getServerCollection(meta.collectionName);
      collection
        .updateAsync(this._id, { $set: { [propertyKey]: value } })
        .catch((e) => console.error(e));
      return;
    }
    Meteor.callAsync(
      meta.collectionName + ".update",
      this._id,
      propertyKey,
      value,
    );
  }

  private setPropertyFromServer(propertyKey: string, value: any): void {
    const userCooldownMs = 2000;
    const attemptApply = () => {
      const queued = this.queuedServerPropertyUpdates[propertyKey];
      if (queued) {
        clearTimeout(queued.timer);
        delete this.queuedServerPropertyUpdates[propertyKey];
      }
      const now = Date.now();
      const lastUserSetAt = this.lastUserPropertySetAt[propertyKey] ?? 0;
      const elapsedSinceUserSet = now - lastUserSetAt;

      if (elapsedSinceUserSet >= userCooldownMs) {
        (this as any)[propertyKey] = value;
        return;
      } else {
        this.queuedServerPropertyUpdates[propertyKey] = {
          value,
          timer: setTimeout(attemptApply, userCooldownMs - elapsedSinceUserSet),
        };
      }
    };
    attemptApply();
  }

  public serialize(): ServerPojo {
    let obj = { _id: this._id } as ServerPojo;
    for (let propertyKey in this[symProperties] ?? {}) {
      obj[propertyKey] = this.propertySignals[propertyKey]();
    }
    return obj;
  }

  /**
   * Copies the initial values for all properties that have an `init` value defined
   * are are still undefined.
   */
  protected copyInitValues(): void {
    for (let propertyKey in this[symProperties] ?? {}) {
      let initValue = this[symProperties][propertyKey].init;
      let value = this.propertySignals[propertyKey]();

      if (value === undefined) {
        if (initValue !== undefined) {
          value = initValue;
        } else {
          throw new Error(
            `Property '${propertyKey}' is undefined and has no init value.`,
          );
        }
      }
      this.propertySignals[propertyKey].set(value);
    }
  }

  /**
   * This method is only mean to be called by PomidorUser
   * because its registration process is special compared to other objects.
   */
  protected makeRegistered(): void {
    this.registered = true;
  }
}
