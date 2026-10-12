import MsoObject, { ClassMeta } from "./MsoObject";
import ObjectsPool from "./ObjectsPool";

export class PoolFactory {
  public static readonly instance: PoolFactory = new PoolFactory();
  private readonly poolByColName: Record<string, ObjectsPool<MsoObject>> = {};

  private constructor() {}

  public getPool<T extends MsoObject>(clazz: new () => T): ObjectsPool<T> {
    const classMeta: ClassMeta = MsoObject.getClazzMeta(clazz);

    let pool = this.poolByColName[classMeta.collectionName];
    if (!pool) {
      pool = new ObjectsPool(clazz);
      this.poolByColName[classMeta.collectionName] = pool;
    }
    return pool as ObjectsPool<T>;
  }
}
