import { Mongo } from "meteor/mongo";
import type { Task } from "/imports/data/tasks/Task";

/**
 * @type {Mongo.Collection<Task, Task>}
 */
export const TaskCollection: Mongo.Collection<Task, Task> = new Mongo.Collection("tasks.Task");
export const MAX_TASKS_PER_USER = 5;
