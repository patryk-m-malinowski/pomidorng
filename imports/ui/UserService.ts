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
    let loading = true;
    Meteor.subscribe("users.allUsers", {
      onReady: () => (loading = false),
    });
    Tracker.autorun(() => {
      const pojo = getPomidorUser();
      if (loading) return;
      this.user.set(
        pojo
          ? PoolFactory.instance
              .getPool(PomidorUser)
              .get(pojo as unknown as ServerPojo)
          : null,
      );
    });
  }
}
