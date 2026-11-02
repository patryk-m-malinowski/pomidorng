import { Component, Input, inject } from "@angular/core";
import { CdkPortalOutlet } from "@angular/cdk/portal";
import { HeaderPortalService } from "#pomidor/ui/HeaderPortalService";
import { ThemeSelector } from "./ThemeSelector";
import { SaveIndicator } from "./header/SaveIndicator";
import CommonDialogsService from "./util/dialog/CommonDialogsService";
import { Router } from "@angular/router";

@Component({
  selector: "header",
  standalone: true,
  imports: [CdkPortalOutlet, ThemeSelector, SaveIndicator],
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

        @if (isApp) {
          <h3
            class="com-patrykmalinowski-pomidor-header-left__welcome-text text-nowrap"
          >
            <span class="hidden lg:inline"
              >Welcome, {{ username ?? "Guest" }}</span
            >
            <span class="lg:hidden">{{ username ?? "Guest" }}</span>
          </h3>
        }

        @if (isApp) {
          <div class="border-l border-l-white h-[80%]"></div>
          <save-indicator />
        }
      </div>

      <div
        class="com-patrykmalinowski-pomidor-header__right flex gap-2 items-center"
      >
        <div class="h-full">
          <ng-template [cdkPortalOutlet]="headerPortalService.rightPortal()" />
        </div>
        <div class="border-l border-l-white h-[80%]"></div>
        <theme-selector
          class="h-full flex items-center justify-center"
        ></theme-selector>
      </div>
    </div>

    <div>
      <ng-template [cdkPortalOutlet]="headerPortalService.menuPortal()" />
    </div>
  `,
})
export class Header {
  @Input() username = "";
  @Input() isApp = false;
  readonly router = inject(Router);

  readonly dialogsApi = inject(CommonDialogsService);
  readonly headerPortalService = inject(HeaderPortalService);

  async onLogoClick(): Promise<void> {
    if (this.isApp) {
      let confirm = await this.dialogsApi.showConfirmation(
        "Go back to main page",
        "Are you sure you want to go back to the main page?",
      );
      if (!confirm) return;
    }
    this.router.navigateByUrl("/");
  }
}
