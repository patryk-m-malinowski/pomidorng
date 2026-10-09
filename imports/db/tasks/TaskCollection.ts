import { Mongo } from "meteor/mongo";
import type { Task } from "/imports/data/tasks/Task";
import { ServerPojo } from "#pomidor/common/mso/ObjectsMgr.js";

/**
 * @type {Mongo.Collection<ServerPojo, ServerPojo>}
 */
export const TaskCollection: Mongo.Collection<ServerPojo, ServerPojo> =
  new Mongo.Collection("tasks.Task");
export const MAX_TASKS_PER_USER = 5;
