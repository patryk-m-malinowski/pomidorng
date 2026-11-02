import { Meteor } from "meteor/meteor";
import {
  MAX_TASKS_PER_USER,
  TaskCollection,
} from "#pomidor/db/tasks/TaskCollection";
import type { Task } from "#pomidor/data/tasks/Task";
import type { ServerPojo } from "#pomidor/common/mso/ObjectsPool";
import { mutexPerUser } from "#pomidor/srv/util/MutexByUser";
import { TASKS_CONSTANTS } from "../../common/TasksConstants";
import { isAdmin } from "../apiUtils";

function validateTask(task: Partial<Task>) {
  if (task.title && task.title.length > TASKS_CONSTANTS.MAX_TITLE_LENGTH) {
    throw new Meteor.Error(
      "title-too-long",
      "Title is too long. Maximum length is " +
        TASKS_CONSTANTS.MAX_TITLE_LENGTH +
        " characters.",
    );
  }
  if (
    task.description &&
    task.description.length > TASKS_CONSTANTS.MAX_DESCRIPTION_LENGTH
  ) {
    throw new Meteor.Error(
      "description-too-long",
      "Description is too long. Maximum length is " +
        TASKS_CONSTANTS.MAX_DESCRIPTION_LENGTH +
        " characters.",
    );
  }
}

Meteor.methods({
  "tasks.Task.insert": mutexPerUser(async function (
    task: ServerPojo,
  ): Promise<void> {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    if (!(await isAdmin())) {
      let tasksFromUser = await TaskCollection.rawCollection().countDocuments({
        createdBy: Meteor.userId()!,
      });

      if (tasksFromUser >= MAX_TASKS_PER_USER) {
        throw new Meteor.Error(
          "task-limit-reached",
          "You have reached the limit of " +
            MAX_TASKS_PER_USER +
            " tasks created from your account. Please delete some tasks if you want to create new ones.",
        );
      }
    }

    task.status = "todo";
    task.createdBy = Meteor.userId()!;
    await TaskCollection.insertAsync(task);
  }),
  "tasks.Task.delete": async function (taskId: string): Promise<void> {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    await TaskCollection.removeAsync(taskId);
  },
  "tasks.Task.update": async function (
    taskId: string,
    propertyName: string,
    value: any,
  ): Promise<void> {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    if (propertyName == "createdBy") {
      throw new Meteor.Error(
        "not-authorized",
        "You cannot change the createdBy property of a task.",
      );
    }
    validateTask({ [propertyName]: value });

    await TaskCollection.updateAsync(taskId, {
      $set: { [propertyName]: value },
    });
  },

  "tasks.assignToUser": async function (
    taskId: string,
    userId: string,
  ): Promise<void> {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    await TaskCollection.updateAsync(taskId, {
      $addToSet: { assignedTo: userId },
    } as any);
  },

  "tasks.unassignFromUser": async function (
    taskId: string,
    userId: string,
  ): Promise<void> {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    await TaskCollection.updateAsync(taskId, {
      $pull: { assignedTo: userId },
    } as any);
  },
});
