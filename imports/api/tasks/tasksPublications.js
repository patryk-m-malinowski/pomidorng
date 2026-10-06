import { Meteor } from "meteor/meteor";
import { TaskCollection } from "/imports/db/tasks/TaskCollection";

Meteor.publish("tasks.Task", function () {
  return TaskCollection.find({});
});