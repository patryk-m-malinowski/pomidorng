import * as Dates from "#pomidor/util/Dates";
import "#pomidor/api/users/usersMethods";
import "#pomidor/api/users/usersPublications";
import { Accounts } from "meteor/accounts-base";
import type { PomidorUser } from "#pomidor/data/users/PomidorUser";
import { pomidorUsers } from "#pomidor/db/users/PomidorUsers";
import { deletePomidorUser } from "#pomidor/api/users/usersMethods";
import { WebApp } from "meteor/webapp";
import "/imports/api/tasks/tasksPublications";
import "/imports/api/tasks/tasksMethods";

async function cleanupOldUsers() {
  let cutoffDate = Dates.addDays(new Date(), -7);
  let toDelete = await pomidorUsers
    .rawCollection()
    .find(
      { isAdmin: { $ne: true }, lastLogin: { $lt: cutoffDate } },
      { projection: { _id: 1 } },
    )
    .toArray();
  await Promise.all(
    toDelete.map((user) => {
      return deletePomidorUser(user._id);
    }),
  );

  setTimeout(cleanupOldUsers, 60 * 1000); // run every minute
}

cleanupOldUsers();

Accounts.onLogin((info: { user: PomidorUser }) => {
  pomidorUsers.updateAsync(info.user._id, { $set: { lastLogin: new Date() } });
});
