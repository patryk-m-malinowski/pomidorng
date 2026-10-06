import { Meteor } from "meteor/meteor";

export interface PomidorSettings {
  public: {
    developer: {
      fullName: string;
      email: string;
      homepage: string;
    },
    users: {
      /**
       * This is a duplicate of the top-level users.maxAccountsPerIp setting,
       * but it's repeated separately here so that we can show this in the user interface.
       */
      maxAccountsPerIp: number;
    }
  },
  users: {
    maxAccountsPerIp: number;
  }
}

export const pomidorSettings: PomidorSettings = Meteor.settings as PomidorSettings;