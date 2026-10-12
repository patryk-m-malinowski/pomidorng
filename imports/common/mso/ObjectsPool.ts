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
  private finalizationRegistry: FinalizationRegistry<string> =
    new FinalizationRegistry((id: string) => {
      delete this.itemsById[id];
    });

  public get(data: ServerPojo): T {
    let obj = this.itemsById[data._id]?.deref();
    if (obj === undefined) {
      obj = new this.clazz();
      this.itemsById[data._id] = new WeakRef(obj);
      this.finalizationRegistry.register(obj, data._id);
    }
    obj.update(data);
    return obj;
  }
  /**
   * Do not call this manually
   * @param obj
   * @returns
   */
  async insert(obj: T): Promise<void> {
    let meta = MsoObject.getClazzMeta(this.clazz);
    let id = await Meteor.callAsync(
      meta.collectionName + ".insert",
      obj.serialize(),
    );
    obj._id = id;
    this.itemsById[obj._id] = new WeakRef(obj);
    this.finalizationRegistry.register(obj, obj._id);
    return;
  }
  /**
   * Internal use only. Do not call manually.
   * @param obj
   */
  async delete(obj: T): Promise<void> {
    let meta = MsoObject.getClazzMeta(this.clazz);
    delete this.itemsById[obj._id];
    await Meteor.callAsync(meta.collectionName + ".delete", obj._id);
  }
}
