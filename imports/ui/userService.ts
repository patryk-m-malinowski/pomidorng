import { Injectable, signal } from "@angular/core";
import type { PomidorUser } from "../data/users/PomidorUser";
import { getPomidorUser } from "../db/users/PomidorUsers";
import { Tracker } from "meteor/tracker";

@Injectable({ providedIn: "root" })
export default class UserService {
  public user = signal<PomidorUser | null>(null);
  constructor() {
    Tracker.autorun(() => {
      this.user.set(getPomidorUser());
    });
  }
}
