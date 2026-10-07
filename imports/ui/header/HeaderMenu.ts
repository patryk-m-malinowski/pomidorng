import { CommonModule } from "@angular/common";
import { Component, model } from "@angular/core";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "header-menu",
  standalone: true,
  imports: [CommonModule, MatIcon],
  template: `
    <div
      class="flex lg:hidden items-center justify-center h-full"
      (click)="open.set(!open())"
    >
      <mat-icon>menu</mat-icon>
    </div>
  `,
})
export class HeaderMenu {
  readonly open = model<boolean>(false);
}
