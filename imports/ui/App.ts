import {
  Component,
  OnDestroy,
  effect,
  inject,
  signal,
  ViewChild,
} from "@angular/core";
import { OfflineDlg } from "./OfflineDlg";
import PendingRequestsService from "/imports/client/PendingRequestsService";
import UserService from "./UserService";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { Header } from "./Header";
import { CommonDialogs } from "./util/dialog/CommonDialogs";
import { Subscription } from "rxjs";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, OfflineDlg, Header, CommonDialogs],
  template: ` <div
    class="com-patrykmalinowski-avocado-web-app flex flex-col h-screen w-screen"
  >
    <header
      [username]="userService.user()?.name ?? ''"
      [isApp]="isApp()"
    ></header>
    <router-outlet></router-outlet>
    <offline-dlg></offline-dlg>
    <common-dialogs></common-dialogs>
  </div>`,
})
export class App implements OnDestroy {
  title = "Angular Meteor App";
  userService: UserService = inject(UserService);
  pendingRequestsService: PendingRequestsService = inject(
    PendingRequestsService,
  );
  readonly router = inject(Router);
  readonly isApp = signal(this.router.url.startsWith("/app"));
  private readonly routerEventsSubscription: Subscription;

  @ViewChild(OfflineDlg)
  offlineDlg!: OfflineDlg;

  constructor() {
    this.routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isApp.set(this.router.url.startsWith("/app"));
      }
    });

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

  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe();
  }
}
