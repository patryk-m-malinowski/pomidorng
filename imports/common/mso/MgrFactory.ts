import MsoObject, { ClassMeta } from "./MsoObject";
import ObjectsMgr from "./ObjectsMgr";

export class MgrFactory {
  public static readonly instance: MgrFactory = new MgrFactory();
  private readonly managerByColName: Record<string, ObjectsMgr<MsoObject>> = {};

  private constructor() {}

  public getManager<T extends MsoObject>(clazz: new () => T): ObjectsMgr<T> {
    const classMeta: ClassMeta = MsoObject.getClazzMeta(clazz);

    let manager = this.managerByColName[classMeta.collectionName];
    if (!manager) {
      manager = new ObjectsMgr(clazz);
      this.managerByColName[classMeta.collectionName] = manager;
    }
    return manager as ObjectsMgr<T>;
  }
}
