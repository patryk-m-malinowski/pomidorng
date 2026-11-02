import {
  Component,
  OnDestroy,
  OnInit,
  effect,
  inject,
  signal,
  ViewChild,
} from "@angular/core";
import { MeteorErrorDlg } from "./util/dialog/MeteorErrorDlg";
import { OfflineDlg } from "./OfflineDlg";
import PendingRequestsService from "#pomidor/client/PendingRequestsService";
import UserService from "./UserService";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { Header } from "./Header";
import { CommonDialogs } from "./util/dialog/CommonDialogs";
import { CdkPortalOutlet } from "@angular/cdk/portal";
import { Subscription } from "rxjs";
import { GlobalErrorHandler } from "./GlobalErrorHandler";
import { WindowPortalService } from "./util/dialog/WindowPortalService";

@Component({
  selector: "pom-root",
  standalone: true,
  imports: [
    CdkPortalOutlet,
    RouterOutlet,
    OfflineDlg,
    Header,
    CommonDialogs,
    MeteorErrorDlg,
  ],
  template: ` <div
    class="com-patrykmalinowski-avocado-web-app flex flex-col h-screen w-screen"
  >
    <pom-header
      [username]="userService.user()?.username"
      [isApp]="isApp()"
    ></pom-header>
    <div id="window-portal">
      @for (portal of windowPortalService.windows(); track portal) {
        <ng-template [cdkPortalOutlet]="portal" />
      }
    </div>
    <router-outlet></router-outlet>
    <pom-offline-dlg></pom-offline-dlg>
    <pom-common-dialogs></pom-common-dialogs>
    <pom-meteor-error-dlg></pom-meteor-error-dlg>
  </div>`,
})
export class App implements OnInit, OnDestroy {
  title = "Angular Meteor App";
  userService: UserService = inject(UserService);
  pendingRequestsService: PendingRequestsService = inject(
    PendingRequestsService,
  );
  readonly router = inject(Router);
  readonly isApp = signal(this.router.url.startsWith("/pomidorapp"));
  private readonly routerEventsSubscription: Subscription;

  readonly windowPortalService = inject(WindowPortalService);

  @ViewChild(OfflineDlg)
  offlineDlg!: OfflineDlg;

  @ViewChild(MeteorErrorDlg)
  errorDlg!: MeteorErrorDlg;

  private errorShown = false;

  private readonly showError = (error: unknown) => {
    if (this.errorShown) return;
    if (!this.errorDlg) {
      // Dialog view not initialized yet (error during first render)
      setTimeout(() => this.showError(error), 50);
      return;
    }
    this.errorShown = true;
    this.errorDlg.open(error ?? "Unknown error");
  };

  private readonly rejectionHandler = (evt: PromiseRejectionEvent) => {
    this.showError(evt.reason);
  };

  private readonly errorHandler = (evt: ErrorEvent) => {
    this.showError(evt.error ?? evt.message);
  };

  constructor() {
    this.routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isApp.set(this.router.url.startsWith("/pomidorapp"));
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

  ngOnInit(): void {
    window.addEventListener("unhandledrejection", this.rejectionHandler);
    GlobalErrorHandler.listener = this.showError;
  }

  ngOnDestroy(): void {
    window.removeEventListener("unhandledrejection", this.rejectionHandler);
    GlobalErrorHandler.listener = undefined;
    this.routerEventsSubscription.unsubscribe();
  }
}
