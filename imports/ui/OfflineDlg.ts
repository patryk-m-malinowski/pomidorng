import { Component, ViewChild } from "@angular/core";
import { Window } from "./util/dialog/Window";

@Component({
  selector: "offline-dlg",
  standalone: true,
  imports: [Window],
  template: `
    <window [userCloseable]="false" title="Connection Lost" className="w-100">
      <p>
        Your connection to the server has been lost. This means your changes
        will not be synced and you will not see others' changes. Please check
        your internet connection and wait until you are reconnected...
      </p>
    </window>
  `,
})
export class OfflineDlg {
  @ViewChild(Window)
  private window?: Window;

  open(): void {
    this.window?.open();
  }

  close(): void {
    this.window?.close();
  }
}
