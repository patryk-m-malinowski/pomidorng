import { Component, inject } from "@angular/core";
import { CdkConnectedOverlay, CdkOverlayOrigin } from "@angular/cdk/overlay";
import ThemeService, {
  THEMES,
  type ThemeId,
} from "/imports/client/ThemeService";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "theme-selector",
  standalone: true,
  imports: [MatIcon, CdkConnectedOverlay, CdkOverlayOrigin],
  template: `
    <div
      cdkOverlayOrigin
      #themeSelectorOrigin="cdkOverlayOrigin"
      class="com-patrykmalinowski-pomidor-header-theme-selector cursor-pointer flex flex-col justify-center"
      (click)="open = !open"
    >
      <mat-icon>{{ THEMES[themeService.activeTheme()].icon }}</mat-icon>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="themeSelectorOrigin"
      [cdkConnectedOverlayOpen]="open"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      [cdkConnectedOverlayOffsetY]="8"
      (backdropClick)="open = false"
    >
      <div class="com-patrykmalinowski-pomidor-popup">
        <div
          class="com-patrykmalinowski-pomidor-selectable-menu rounded-sm shadow-lg"
        >
          @for (themeId of themeIds; track themeId) {
            <div
              class="com-patrykmalinowski-pomidor-selectable-menu__item"
              [class.com-patrykmalinowski-pomidor-selectable-menu__item--selected]="
                themeId === themeService.userChoice()
              "
              (click)="selectTheme(themeId)"
            >
              <div class="flex items-center gap-1">
                <mat-icon>{{ THEMES[themeId].icon }}</mat-icon>
                <span>{{ THEMES[themeId].title }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </ng-template>
  `,
})
export class ThemeSelector {
  readonly THEMES = THEMES;
  readonly themeService = inject(ThemeService);
  readonly themeIds = Object.keys(THEMES) as ThemeId[];

  open = false;

  selectTheme(themeId: ThemeId): void {
    this.themeService.userChoice.set(themeId);
    this.open = false;
  }
}
