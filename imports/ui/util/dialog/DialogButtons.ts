import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

interface ButtonInfo {
  label: string;
  icon: string;
  submit?: boolean;
}

const BUTTON_INFOS = {
  ok: { label: "OK", submit: true, icon: "check" },
  cancel: { label: "Cancel", icon: "close" },
  yes: { label: "Yes", submit: true, icon: "check" },
  no: { label: "No", icon: "close" },
  close: { label: "Close", icon: "close" },
} as const satisfies Record<string, ButtonInfo>;

const BUTTON_IDS = Object.keys(BUTTON_INFOS) as ButtonKind[];

export type ButtonKind = keyof typeof BUTTON_INFOS;

@Component({
  selector: "pom-dialog-buttons",
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="com-patrykmalinowski-pomidor-dialog-buttons">
      @for (btn of BUTTON_IDS; track btn) {
        @if (normalizedShow.includes(btn)) {
          <button
            [attr.type]="BUTTON_INFOS[btn].submit ? 'submit' : 'button'"
            (click)="onClick(btn)"
          >
            <mat-icon>{{ BUTTON_INFOS[btn].icon }}</mat-icon>
            {{ BUTTON_INFOS[btn].label }}
          </button>
        }
      }
    </div>
  `,
})
export class DialogButtons {
  @Input() show?: ButtonKind[] | string;
  @Output() press = new EventEmitter<ButtonKind>();
  @Output() cancel = new EventEmitter<void>();

  readonly BUTTON_INFOS = BUTTON_INFOS;
  readonly BUTTON_IDS = BUTTON_IDS;

  get normalizedShow(): ButtonKind[] {
    if (!this.show) {
      return ["ok", "cancel"];
    }

    if (typeof this.show === "string") {
      const parsed = this.show
        .split(",")
        .map((part) => part.trim())
        .filter((part): part is ButtonKind => part in BUTTON_INFOS);
      return parsed;
    }

    return this.show.filter((btn): btn is ButtonKind => btn in BUTTON_INFOS);
  }

  onClick(btn: ButtonKind): void {
    this.press.emit(btn);
    if (btn === "cancel") {
      this.cancel.emit();
    }
  }
}
