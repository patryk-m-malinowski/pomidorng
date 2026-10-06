import { Component, Input, inject } from "@angular/core";
import { CdkPortalOutlet } from "@angular/cdk/portal";
import { HeaderPortalService } from "/imports/ui/header-portal.service";
import { ThemeSelector } from "./theme-selector.component";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CdkPortalOutlet, ThemeSelector],
  template: `
    <div class="com-patrykmalinowski-pomidor-header">
      <div
        class="com-patrykmalinowski-pomidor-header-left overflow-hidden flex items-center gap-2.5"
      >
        <div
          class="com-patrykmalinowski-pomidor-logo-with-text flex gap-2.5 items-center justify-center cursor-pointer"
          (click)="onLogoClick()"
        >
          <div class="com-patrykmalinowski-pomidor-logo-in-box">
            <img
              src="/ltf-logo-64.jpg"
              alt="LTF Logo"
              class="com-patrykmalinowski-pomidor-logo-in-box__logo"
            />
          </div>
        </div>

        @if (isApp && username) {
          <h3
            class="com-patrykmalinowski-pomidor-header-left__welcome-text text-nowrap"
          >
            <span class="hidden lg:inline">Welcome, {{ username }}</span>
            <span class="lg:hidden">{{ username }}</span>
          </h3>
        }

        @if (isApp) {
          <div class="border-l border-l-white h-[80%]"></div>
          <div class="com-patrykmalinowski-pomidor-header-save-indicator"></div>
        }
      </div>

      <div
        class="com-patrykmalinowski-pomidor-header__right flex gap-2 items-center"
      >
        <div class="h-full">
          <ng-template [cdkPortalOutlet]="headerPortalService.rightPortal()" />
        </div>
        <div class="border-l border-l-white h-[80%]"></div>
        <app-theme-selector
          class="h-full flex items-center justify-center"
        ></app-theme-selector>
      </div>
    </div>

    <div id="pomidor-portal-header-menu">
      <ng-template [cdkPortalOutlet]="headerPortalService.menuPortal()" />
    </div>
  `,
})
export class Header {
  @Input() username = "";
  @Input() isApp = false;
  readonly headerPortalService = inject(HeaderPortalService);

  async onLogoClick(): Promise<void> {
    if (this.isApp) {
      // Placeholder for "confirm and navigate" logic from the React version.
    }
  }
}
