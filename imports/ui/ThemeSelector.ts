import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
} from "@angular/core";
import ThemeService, {
  THEMES,
  type ThemeId,
} from "/imports/client/ThemeService";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "theme-selector",
  standalone: true,
  imports: [MatIcon],
  template: `
    <div
      class="com-patrykmalinowski-pomidor-header-theme-selector cursor-pointer flex flex-col justify-center"
      (click)="open = true"
    >
      <mat-icon>{{ THEMES[themeService.activeTheme()].icon }}</mat-icon>
    </div>

    @if (open) {
      <div class="absolute right-0 top-0 z-10 mt-2">
        <div
          class="com-patrykmalinowski-pomidor-selectable-menu bg-white text-black shadow-md rounded-sm"
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
    }
  `,
})
export class ThemeSelector {
  readonly THEMES = THEMES;
  readonly themeService = inject(ThemeService);
  readonly themeIds = Object.keys(THEMES) as ThemeId[];

  open = false;

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @HostListener("document:click", ["$event.target"])
  onDocumentClick(target: Node): void {
    if (this.open && !this.elementRef.nativeElement.contains(target)) {
      this.open = false;
    }
  }

  selectTheme(themeId: ThemeId): void {
    this.themeService.userChoice.set(themeId);
    this.open = false;
  }
}
