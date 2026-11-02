import { Component, Input, ViewChild } from "@angular/core";
import { Window } from "./Window";

@Component({
  selector: "pom-submittable-dlg",
  standalone: true,
  imports: [Window],
  template: `
    <pom-window [title]="title" (onClose)="onWindowClose()">
      <ng-content></ng-content>
    </pom-window>
  `,
})
export class SubmittableDlg<T = unknown> {
  @Input() title = "";

  @ViewChild(Window)
  private window?: Window;

  private resolveOpen: ((result: T | null) => void) | null = null;

  open(): Promise<T | null> {
    this.window!.open();
    return new Promise<T | null>((resolve) => {
      this.resolveOpen = resolve;
    });
  }

  submit(result: T | null): void {
    if (!this.resolveOpen) {
      throw new Error("Dialog is not open.");
    }

    const resolve = this.resolveOpen;
    this.resolveOpen = null;
    resolve(result);
    this.window?.close();
  }

  onWindowClose(): void {
    if (this.resolveOpen) {
      this.submit(null);
    }
  }
}
