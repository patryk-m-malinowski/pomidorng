type Queue = {
  promise: Promise<void>;
  size: number;
};

/**
 * A mutex implementation that allows queuing of asynchronous tasks based on a key.
 * Each key has its own queue, ensuring that tasks for the same key are executed sequentially,
 * while tasks for different keys can run concurrently.
 */
export class MutexByKey {
  private queues: Record<string, Queue> = {};

  constructor() { }

  public queue<T>(key: string, fn: () => T): Promise<T> {
    let queue =
      this.queues[key] ??
      (this.queues[key] = {
        promise: Promise.resolve(),
        size: 0,
      });

    queue.size++;

    const task = queue.promise.then(() => fn());

    queue.promise = task
      .catch(() => { })
      .then(() => {
        queue.size--;
        if (queue.size === 0) {
          delete this.queues[key];
        }
      });

    return task;
  }
}