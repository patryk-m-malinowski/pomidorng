import MsoObject from "./MsoObject";
import ObjectsPool, { ServerPojo } from "./ObjectsPool";
import { PoolFactory } from "./PoolFactory";

/**
 * Utility class for mapping server-side POJOs to managed objects in the pool.
 * You only need to use this class if you are dealing with server objects that can be registered from the client.
 *
 * The problem that it solves is that when an object is created and registered on the client,
 * the server may fire a publication with that new object before it has been given a database ID on the client,
 * which may cause duplicate server objects to be created.
 * Therefore, we need to wait for pending registrations to finish before we update the data from the server.
 *
 * If we receive data from a publication but there are pending client registrations,
 * we only output the data for objects that are already in the pool,
 * and waits for the pending registrations to complete before adding the new objects to the pool.
 */
export default class ServerObjectMapper<T extends MsoObject> {
  private pool: ObjectsPool<T>; //reference to the pool
  private awaitingRegistrations: Promise<void[]> | null = null;

  /**
   *
   * @param clazz The server object class that this maps to
   * @param outputCb A callback fired with the mapped objects
   */
  constructor(
    clazz: new () => T,
    private outputCb: (out: T[]) => void,
  ) {
    this.pool = PoolFactory.instance.getPool(clazz);
  }

  /**
   * Call this method with incoming data from the server.
   */
  public setInput(data: ServerPojo[]) {
    this.awaitingRegistrations = null;
    const pool = this.pool;
    if (!pool.getPendingRegistrations().length) {
      const out: T[] = data.map((item) => pool.createOrUpdate(item));
      this.yield(out);
      return;
    }
    //If we have objects not in this pool,
    //we don't want to add them in just yet
    //because there may already be objects in the process of registering
    //which they may match against,
    //and we need to wait until they receive an ID.
    const out: T[] = [];
    const notInPool: ServerPojo[] = [];
    for (let item of data) {
      if (pool.getById(item._id)) {
        out.push(pool.createOrUpdate(item));
      } else {
        //means there must be pending registrations
        notInPool.push(item);
      }
    }
    this.yield(out);
    if (notInPool.length > 0) {
      let awaitingRegistrations = Promise.all(pool.getPendingRegistrations());
      this.awaitingRegistrations = awaitingRegistrations;
      awaitingRegistrations.then(() => {
        if (this.awaitingRegistrations !== awaitingRegistrations) return;
        for (let item of notInPool) {
          out.push(pool.createOrUpdate(item));
        }
        this.yield(out.slice()); //Have to create a shallow copy so that signals can detect that the reference has changed.
      });
    }
  }

  private yield(out: T[]) {
    this.outputCb(out);
  }
}
