import MsoObject from "/imports/common/mso/MsoObject";

@MsoObject.Meta({
  collectionName: "users",
})
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
  @MsoObject.Property({ client: "readonly" })
  declare lastLogin: Date | null;
  //Hash of the IP address of the user at the time of registration to prevent abuse of the system. GDPR-sensitive.
  @MsoObject.Property({ client: "hidden" }) //This should be controlled by the publication, but we will mark it like this for documentation purposes
  declare registrationIp: string;
  /**
   * Users which were created manually in the users editor as opposed to registration.
   * Non admin users can only delete playground users
   */
  @MsoObject.Property({ client: "hidden", init: false })
  declare playgroundUser: boolean;
}
