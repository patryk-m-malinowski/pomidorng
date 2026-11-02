import type { ServerPojo } from "./ObjectsPool";

/**
 * Looks up a collection previously defined with `new Mongo.Collection(name)`.
 * (`Mongo.getCollection` exists at runtime but is missing from the typings.)
 */
export function getServerCollection(
  name: string,
): Mongo.Collection<ServerPojo, ServerPojo> {
  throw new Error("getServerCollection is not implemented yet!");
}
