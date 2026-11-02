import { Component, Input, signal, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DialogButtons } from "./DialogButtons";
import { SubmittableDlg } from "./SubmittableDlg";

@Component({
  selector: "pom-prompt-dlg",
  standalone: true,
  imports: [SubmittableDlg, DialogButtons, FormsModule],
  template: `
    <pom-submittable-dlg [title]="title()">
      <form
        class="com-patrykmalinowski-pomidor-form flex flex-col gap-1.5"
        (submit)="onSubmit($event)"
      >
        <p class="max-w-lg">{{ message() }}</p>
        <input
          type="text"
          name="value"
          [(ngModel)]="value"
          [attr.maxlength]="maxLength ?? null"
          required
        />
        <pom-dialog-buttons
          [show]="['ok', 'cancel']"
          (cancel)="onCancel()"
        ></pom-dialog-buttons>
      </form>
    </pom-submittable-dlg>
  `,
})
export class PromptDlg {
  @Input() maxLength?: number;

  @ViewChild(SubmittableDlg)
  private dialog?: SubmittableDlg<string>;

  readonly title = signal("Prompt");
  readonly message = signal("Enter a value:");
  readonly value = signal("");

  open(
    title: string,
    message: string,
    defaultValue?: string,
  ): Promise<string | null> {
    this.title.set(title);
    this.message.set(message);
    this.value.set(defaultValue ?? "");
    return this.dialog?.open() ?? Promise.resolve(null);
  }

  onCancel(): void {
    this.dialog?.submit(null);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.dialog?.submit(this.value());
  }
}
