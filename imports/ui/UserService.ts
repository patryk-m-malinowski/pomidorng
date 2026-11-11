import { Injectable, signal } from "@angular/core";
import { PomidorUser } from "../data/users/PomidorUser";
import { PoolFactory } from "../common/mso/PoolFactory";
import type { ServerPojo } from "../common/mso/ObjectsPool";
import { getPomidorUser } from "../db/users/PomidorUsers";
import { Tracker } from "meteor/tracker";

@Injectable({ providedIn: "root" })
export default class UserService {
  public user = signal<PomidorUser | null>(null);
  constructor() {
    Tracker.autorun(() => {
      let handle = Meteor.subscribe("users.allUsers");
      const pojo = getPomidorUser();
      if (!handle.ready()) return;
      this.user.set(
        pojo
          ? PoolFactory.instance
              .getPool(PomidorUser)
              .createOrUpdate(pojo as unknown as ServerPojo)
          : null,
      );
    });
  }
}
