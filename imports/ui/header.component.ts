import { Component, Input } from "@angular/core";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [NgIf],
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

        <h3
          *ngIf="isApp && username"
          class="com-patrykmalinowski-pomidor-header-left__welcome-text text-nowrap"
        >
          <span class="hidden lg:inline">Welcome, {{ username }}</span>
          <span class="lg:hidden">{{ username }}</span>
        </h3>

        <ng-container *ngIf="isApp">
          <div class="border-l border-l-white h-[80%]"></div>
          <div class="com-patrykmalinowski-pomidor-header-save-indicator"></div>
        </ng-container>
      </div>

      <div
        class="com-patrykmalinowski-pomidor-header__right flex gap-2 items-center"
      >
        <div id="pomidor-portal-header-right" class="h-full"></div>
        <div class="border-l border-l-white h-[80%]"></div>
        <div
          class="com-patrykmalinowski-pomidor-header-theme-selector flex justify-stretch items-stretch"
        ></div>
      </div>
    </div>

    <div id="pomidor-portal-header-menu"></div>
  `,
})
export class Header {
  @Input() username = "";
  @Input() isApp = false;

  async onLogoClick(): Promise<void> {
    if (this.isApp) {
      // Placeholder for "confirm and navigate" logic from the React version.
    }
  }
}
