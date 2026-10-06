import { Meteor } from "meteor/meteor";
import { pomidorUsers } from "/imports/db/users/PomidorUsers";


Meteor.publish("users.allUsers", function () {
  return pomidorUsers.find({});
});
