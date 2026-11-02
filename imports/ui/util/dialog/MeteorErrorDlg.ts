import { Component, ViewChild, signal } from "@angular/core";
import { pomidorSettings } from "#pomidor/common/PomidorSettings";
import { DialogButtons } from "./DialogButtons";
import { Window } from "./Window";

@Component({
  selector: "meteor-error-dlg",
  standalone: true,
  imports: [Window, DialogButtons],
  template: `
    <window title="Runtime Error" className="w-150" [userCloseable]="false">
      <div class="flex flex-col gap-1.5">
        <div class="flex gap-2">
          <span class="material-icons text-2xl">cancel</span>
          <p>
            We're sorry, but an unrecoverable error has occurred in the
            application, causing it to crash. If the problem persists, please
            report it to the developer (<a
              class="select-text"
              [href]="'mailto:' + email"
              >{{ email }}</a
            >), quoting the information below:
          </p>
        </div>
        <textarea class="min-h-100" readonly [value]="detail()"></textarea>
        <dialog-buttons show="ok" (press)="reload()"></dialog-buttons>
      </div>
    </window>
  `,
})
export class MeteorErrorDlg {
  readonly email = pomidorSettings.public.developer.email;
  readonly detail = signal("Unknown Error");

  @ViewChild(Window)
  private window?: Window;

  open(detail: unknown): void {
    this.detail.set(MeteorErrorDlg.stringify(detail));
    this.window?.open();
  }

  reload(): void {
    document.location.href = document.location.href;
  }

  private static stringify(detail: unknown): string {
    if (detail instanceof Error) {
      return detail.stack ?? `${detail.name}: ${detail.message}`;
    }
    if (typeof detail === "string") {
      return detail;
    }
    try {
      return JSON.stringify(detail, null, 2) ?? String(detail);
    } catch {
      return String(detail);
    }
  }
}
