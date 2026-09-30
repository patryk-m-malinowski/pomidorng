import { Component, ViewChild } from "@angular/core";
import { WindowComponent } from "./util/dialog/window.component";

@Component({
  selector: "app-offline-dlg",
  standalone: true,
  imports: [WindowComponent],
  template: `
    <app-window
      [userCloseable]="false"
      title="Connection Lost"
      className="w-100"
    >
      <p>
        Your connection to the server has been lost. This means your changes
        will not be synced and you will not see others' changes. Please check
        your internet connection and wait until you are reconnected...
      </p>
    </app-window>
  `,
})
export class OfflineDlg {
  @ViewChild(WindowComponent)
  private window?: WindowComponent;

  open(): void {
    this.window?.open();
  }

  close(): void {
    this.window?.close();
  }
}
