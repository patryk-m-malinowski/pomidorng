import { CommonModule } from "@angular/common";
import { Component, Input, model } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import type { Page } from "./Page";

@Component({
  selector: "header-tabs",
  standalone: true,
  imports: [CommonModule, MatIcon],
  template: `
    <div class="com-patrykmalinowski-pomidor-header-tabs h-full flex">
      @for (pageEntry of Object.entries(pages); track pageEntry[0]) {
        @let id = pageEntry[0];
        @let page = pageEntry[1];
        <div
          class="com-patrykmalinowski-pomidor-header-tabs__button flex justify-between items-center"
          [class.com-patrykmalinowski-pomidor-header-tabs__button--selected]="
            pageEntry[0] === selectedPage()
          "
          (click)="selectedPage.set(id)"
        >
          <mat-icon class="text-2xl">{{ page.icon }}</mat-icon>
          <span class="w-1.25"></span>
          <span>{{ page.title }}</span>
        </div>
      }
    </div>
  `,
})
export class HeaderTabs {
  readonly Object = Object;
  readonly selectedPage = model<string>("");
  @Input() pages: Record<string, Page> = {};

  get pageEntries(): [string, Page][] {
    return Object.entries(this.pages) as [string, Page][];
  }
}
