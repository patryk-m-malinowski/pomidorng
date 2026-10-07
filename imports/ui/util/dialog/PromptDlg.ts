import { Component, Input, ViewChild } from "@angular/core";
import { DialogButtons } from "./DialogButtons";
import { SubmittableDlg } from "./SubmittableDlg";

@Component({
  selector: "prompt-dlg",
  standalone: true,
  imports: [SubmittableDlg, DialogButtons],
  template: `
    <submittable-dlg [title]="title">
      <form
        class="com-patrykmalinowski-pomidor-form flex flex-col gap-1.5"
        (submit)="onSubmit($event)"
      >
        <p class="max-w-lg">{{ message }}</p>
        <input
          type="text"
          [value]="value"
          [maxLength]="maxLength"
          required
          (input)="onInput($event)"
        />
        <dialog-buttons
          [show]="['ok', 'cancel']"
          (cancel)="onCancel()"
        ></dialog-buttons>
      </form>
    </submittable-dlg>
  `,
})
export class PromptDlg {
  @Input() maxLength?: number;

  @ViewChild(SubmittableDlg)
  private dialog?: SubmittableDlg<string>;

  title = "Prompt";
  message = "Enter a value:";
  value = "";

  open(
    title: string,
    message: string,
    defaultValue?: string,
  ): Promise<string | null> {
    this.title = title;
    this.message = message;
    this.value = defaultValue ?? "";
    return this.dialog?.open() ?? Promise.resolve(null);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
  }

  onCancel(): void {
    this.dialog?.submit(null);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.dialog?.submit(this.value);
  }
}
