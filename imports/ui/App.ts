import { Component, effect, inject, ViewChild } from "@angular/core";
import { OfflineDlg } from "./OfflineDlg";
import PendingRequestsService from "/imports/client/PendingRequestsService";
import UserService from "./UserService";
import { RouterOutlet } from "@angular/router";
import { Header } from "./Header";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, OfflineDlg, Header],
  template: ` <div
    class="com-patrykmalinowski-avocado-web-app flex flex-col h-screen w-screen"
  >
    <header [username]="userService.user()?.name ?? ''"></header>
    <router-outlet></router-outlet>
    <offline-dlg></offline-dlg>
  </div>`,
})
export class App {
  title = "Angular Meteor App";
  userService: UserService = inject(UserService);
  pendingRequestsService: PendingRequestsService = inject(
    PendingRequestsService,
  );
  @ViewChild(OfflineDlg)
  offlineDlg!: OfflineDlg;

  constructor() {
    effect(() => {
      const offline = this.pendingRequestsService.offline();
      if (this.offlineDlg) {
        if (!offline) {
          this.offlineDlg.close();
        } else {
          this.offlineDlg.open();
        }
      }
    });
  }
}
