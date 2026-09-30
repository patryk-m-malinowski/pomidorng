import { Meteor } from "meteor/meteor";

export interface PomidorUser extends Meteor.User {
  /**
   * @override
   * This is always defined
   */
  createdAt: Date,
  /**
   * @override
   * Override this because Pomidor users always have a username
   */
  username: string;
  isAdmin: boolean;
  lastLogin: Date;
  registrationIp: string; //Hash of the IP address of the user at the time of registration to prevent abuse of the system. GDPR-sensitive.
  /**
   * Users which were created manually in the users editor as opposed to registration.
   * Non admin users can only delete playground users
   */
  playgroundUser: boolean;
}