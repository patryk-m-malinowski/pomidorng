import { pomidorUsers } from "#pomidor/db/users/PomidorUsers";
import MsoObject from "#pomidor/common/mso/MsoObject";

@MsoObject.Meta({
  collectionName: "users",
  clientRegisterable: false,
})
//Note: For now, you cannot re-use the object after it's been registered on the server.
export class PomidorUser extends MsoObject {
  @MsoObject.Property({ client: "readonly" })
  declare createdAt: Date;
  /**
   * This property is special, so we don't want it to be sent to the server
   */
  @MsoObject.Property({ client: "readonly", init: "" })
  declare username: string;
  @MsoObject.Property({ init: false })
  declare isAdmin: boolean;
  @MsoObject.Property({ client: "readonly", init: null })
  declare lastLogin: Date | null;
  //Hash of the IP address of the user at the time of registration to prevent abuse of the system. GDPR-sensitive.
  @MsoObject.Property({ client: "hidden" }) //This should be controlled by the publication, but we will mark it like this for documentation purposes
  declare registrationIp: string;
  /**
   * Users which were created manually in the users editor as opposed to registration.
   * Non admin users can only delete playground users
   */
  @MsoObject.Property({ init: false })
  declare playgroundUser: boolean;

  public async registerInAccounts({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<void> {
    let id = await Accounts.createUserAsync({ username, password });
    //Later, we will register the user in our MsoObject system as well
    //but this is not needed right now
    try {
      this.createdAt = new Date();
      this._id = id; //The _id property must be set last!

      let updates: Record<string, any> = {};
      this.copyInitValues();
      let serialized = this.serialize();
      for (let key in serialized) {
        if (["username"].includes(key)) {
          continue;
        }
        updates[key] = serialized[key];
      }
      await pomidorUsers.updateAsync(id, {
        $set: updates,
      });
      this.makeRegistered();
    } catch (e) {
      // If there is an error, we should remove the user from Accounts to avoid partially-created accounts
      await Meteor.users.removeAsync(id);
      throw e;
    }
  }
}
