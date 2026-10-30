import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import * as ConnectionUtils from "/imports/util/ConnectionUtils";
import { pomidorUsers } from "/imports/db/users/PomidorUsers";
import { MutexByKey } from "../../common/util/MutexByKey";
import { pomidorSettings } from "/imports/common/PomidorSettings";
import { TaskCollection } from "/imports/db/tasks/TaskCollection";
import { isAdmin } from "../apiUtils";
import { PomidorUser } from "#pomidor/data/users/PomidorUser.js";

let mutexCreateUser = new MutexByKey();

Meteor.methods({
  /**
   *
   * @param id The ID of the user we are modifying
   * @param property Name of property we are modifying
   * @param value Value of the property to set
   */
  "users.update": async function (
    id: string,
    property: string,
    value: any,
  ): Promise<void> {
    if (property !== "isAdmin") {
      throw new Meteor.Error(
        403,
        "isAdmin is currently the only supported property name",
      );
    }
    if (!(id === Meteor.userId() || (await isAdmin()))) {
      throw new Meteor.Error(403, "not-authorized");
    }
    if (property === "isAdmin" && !(await isAdmin())) {
      throw new Meteor.Error(403, "not-authorized");
    }

    await pomidorUsers.updateAsync(id, { $set: { [property]: value } });
  },
  "users.setUsername": async function (
    id: string,
    username: string,
  ): Promise<{ ok?: boolean; error?: string }> {
    if (!(id === Meteor.userId() || (await isAdmin()))) {
      throw new Meteor.Error("not-authorized");
    }

    try {
      await Accounts.setUsername(id, username);
    } catch (e: any) {
      if (e.error === 403) {
        return { error: "username-taken" };
      }
      throw e;
    }
    return { ok: true };
  },

  "users.changePassword": async function (
    id: string,
    password: string,
  ): Promise<void> {
    if (!(await isAdmin())) {
      throw new Meteor.Error("not-authorized");
    }
    await Accounts.setPasswordAsync(id, password, { logout: false });
  },

  "users.createUser": async function ({
    username,
    password,
    playgroundUser,
  }: {
    username: string;
    password: string;
    playgroundUser: boolean;
  }): Promise<{ userId?: string; error?: string }> {
    let ipHash = ConnectionUtils.getClientIpHash(this.connection!);
    async function impl() {
      const maxAccountsPerIp = pomidorSettings.users.maxAccountsPerIp;
      //first check for abuse of the registration system by checking if we have exceeded the limit of registrations per IP address

      if (maxAccountsPerIp) {
        let registrationsFromIp = await pomidorUsers
          .rawCollection()
          .countDocuments({ registrationIp: ipHash });
        if (registrationsFromIp >= maxAccountsPerIp) {
          return { error: `account-limit-reached` };
        }
      }

      let userId;
      let properties = {
        registrationIp: ipHash,
        lastLogin: null,
        isAdmin: false,
      } as Partial<PomidorUser>;

      try {
        userId = await Accounts.createUserAsync({ username, password });
        if (playgroundUser) {
          properties.playgroundUser = true;
        }
      } catch (e: any) {
        if (e.error === 403) {
          return { error: "username-taken" };
        }
        throw e;
      }
      await pomidorUsers.updateAsync(userId, {
        $set: properties,
      });
      return { userId };
    }

    //Ensure this is mutexed per IP so we can reliably stop abuse of the registration system.
    return await mutexCreateUser.queue(ipHash, impl);
  },

  "users.removeUser": async function (id: string): Promise<void> {
    let user = await pomidorUsers.findOneAsync(id);

    if (!user) {
      throw new Error("User not found");
    }

    let admin = await isAdmin();
    //Users can remove themselves
    //Admins can remove anyone
    //Playground users can be removed by any registered user
    if (
      !(
        id === Meteor.userId() ||
        admin ||
        (Meteor.userId() && user.playgroundUser)
      )
    ) {
      throw new Meteor.Error(403, "Not authorized");
    }
    await deletePomidorUser(id);
  },

  "users.getConnectionInfo": async function (): Promise<Object> {
    return {
      clientAddress: this.connection!.clientAddress,
      httpHeaders: this.connection!.httpHeaders,
    };
  },
});

/**
 * Deletes a Pomidor user, and all tasks created by that user.
 * @param id
 * @returns
 */
export async function deletePomidorUser(id: string) {
  let user = await pomidorUsers.findOneAsync(id);
  if (!user) {
    return; //perhops something else has deleted it
  }
  await pomidorUsers.removeAsync(id);
  //delete all tasks created by this user
  await TaskCollection.removeAsync({ createdBy: id });
}
