import { Component, Input, ViewChild } from "@angular/core";
import { ButtonKind, DialogButtons } from "./DialogButtons";
import { SubmittableDlg } from "./SubmittableDlg";

@Component({
  selector: "common-dlg",
  standalone: true,
  imports: [SubmittableDlg, DialogButtons],
  template: `
    <submittable-dlg [title]="title">
      <div class="flex flex-col gap-1.5">
        <div class="flex gap-2.5 items-start">
          <span class="material-icons text-2xl border-2 rounded-full">{{
            icon
          }}</span>
          <p class="max-w-lg">{{ message }}</p>
        </div>
        <dialog-buttons
          [show]="buttons"
          (press)="onPress($event)"
        ></dialog-buttons>
      </div>
    </submittable-dlg>
  `,
})
export class CommonDlg {
  @Input() buttons: ButtonKind[] | string = "ok";
  @Input() icon = "info";

  @ViewChild(SubmittableDlg)
  private dialog?: SubmittableDlg<ButtonKind>;

  title = "";
  message = "";

  open(title: string, message: string): Promise<ButtonKind | null> {
    this.title = title;
    this.message = message;
    return this.dialog?.open() ?? Promise.resolve(null);
  }

  onPress(btn: ButtonKind): void {
    this.dialog?.submit(btn);
  }
}
