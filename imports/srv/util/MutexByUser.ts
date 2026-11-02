import { Meteor } from "meteor/meteor";
import { MutexByKey } from "#pomidor/util/MutexByKey";

/**
 * Takes a callback and returns a function which calls the callback in a mutex per user basis
 * i.e. at most one call per user can be in progress at a time.
 */
export function mutexPerUser<Args extends any[], ThisType, ReturnType>( //!todo put into apiUtils
  fn: (this: ThisType, ...args: Args) => Promise<ReturnType>,
) {
  let mutex = new MutexByKey();
  return async function (this: ThisType, ...args: Args): Promise<ReturnType> {
    const userId = Meteor.userId();

    if (!userId) {
      throw new Meteor.Error("not-authorized");
    }

    return await mutex.queue(userId, () => fn.apply(this, args));
  };
}
