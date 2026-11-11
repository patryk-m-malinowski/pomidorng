import { getServerCollection } from "./getServerCollection";
import MsoObject from "./MsoObject";

export interface ServerPojo {
  _id: string;
  [key: string]: unknown;
}
export default class ObjectsPool<T extends MsoObject> {
  constructor(private readonly clazz: new () => T) {}
  /**
   * We use a weak registry to ensure that duplicate objects with the same ID are not created;
   */
  private itemsById: Record<string, WeakRef<T>> = {};
  private pendingRegistrations: Promise<void>[] = [];
  //We need this to delete entries for object which have been garbage-collected.
  private finalizationRegistry: FinalizationRegistry<string> =
    new FinalizationRegistry((id: string) => {
      delete this.itemsById[id];
    });

  public getById(id: string): T | undefined {
    const obj = this.itemsById[id]?.deref();
    return obj;
  }

  /**
   * Creates a new object if it doesn't exist in the pool with the data,
   * or updates the existing object with the new data.
   *
   * @param data
   * @returns
   */
  public createOrUpdate(data: ServerPojo): T {
    let obj = this.itemsById[data._id]?.deref();
    if (obj === undefined) {
      obj = new this.clazz();
      obj.update(data);
      this.addObject(obj);
    } else {
      obj.update(data);
    }
    return obj;
  }

  /**
   * Internal use only. Do not call manually.
   */
  addPendingRegistration(promise: Promise<void>): void {
    this.pendingRegistrations.push(promise);
  }

  /**
   * Internal use only. Do not call manually.
   */
  removePendingRegistration(promise: Promise<void>): void {
    const index = this.pendingRegistrations.indexOf(promise);
    if (index !== -1) {
      this.pendingRegistrations.splice(index, 1);
    } else {
      throw new Error(`Object is not in the pending registrations list.`);
    }
  }

  /**
   * Do not modify the returned value.
   */
  getPendingRegistrations(): Promise<void>[] {
    return this.pendingRegistrations;
  }
  /**
   * Internal use only. Do not call manually.
   * @param obj
   * @returns
   */
  addObject(obj: T) {
    if (this.getById(obj._id)) {
      throw new Error(
        `Object with _id ${obj._id} is already registered. This probably means that a duplicate object was created from a publication before it managed to register.`,
      );
    }
    this.itemsById[obj._id] = new WeakRef(obj);
    this.finalizationRegistry.register(obj, obj._id);
  }
  /**
   * Internal use only. Do not call manually.
   * @param obj
   */
  removeObject(obj: T) {
    delete this.itemsById[obj._id];
    this.finalizationRegistry.unregister(obj);
  }
}
