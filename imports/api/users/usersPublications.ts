import { Meteor } from "meteor/meteor";
import { pomidorUsers } from "#pomidor/db/users/PomidorUsers";

Meteor.publish("users.allUsers", function () {
  //Unfortunately, when a user is registered, partial data is inserted into the database,
  //so we don't want partial data to be sent to the client
  return pomidorUsers.find({ createdAt: { $exists: true } });
});
