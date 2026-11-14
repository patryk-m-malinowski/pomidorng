import { Component, ViewChild, inject, OnDestroy, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Window } from "#pomidor/ui/util/dialog/Window";
import ProgressPopupService from "./ProgressPopupService";

@Component({
  selector: "pom-progress-popup-dlg",
  standalone: true,
  imports: [CommonModule, Window],
  template: `
    <pom-window [userCloseable]="false" title="Progress" className="w-80">
      <div class="flex flex-col gap-3 p-4">
        <div class="flex flex-col gap-2">
          @for (message of messages(); track message.id) {
            <div>{{ message.text }}</div>
          }
        </div>
        <div class="flex items-center gap-3">
          <div class="spinner"></div>
        </div>
      </div>
    </pom-window>
  `,
  styles: [
    `
      .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #333;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class ProgressPopupDlg {
  @ViewChild(Window)
  private window?: Window;

  private readonly progressService = inject(ProgressPopupService);
  readonly messages = signal<Array<{ id: number; text: string }>>([]);
  private _isOpen = false;

  constructor() {
    this.progressService.registerHost(this);
  }

  ngOnDestroy(): void {
    this.progressService.unregisterHost(this);
  }

  addMessage(taskId: number, message: string): void {
    this.messages.update((msgs) => [...msgs, { id: taskId, text: message }]);
  }

  removeMessage(taskId: number): void {
    this.messages.update((msgs) => msgs.filter((m) => m.id !== taskId));
  }

  isOpen(): boolean {
    return this._isOpen;
  }

  open(): void {
    this._isOpen = true;
    this.window?.open();
  }

  close(): void {
    this._isOpen = false;
    this.window?.close();
  }
}
