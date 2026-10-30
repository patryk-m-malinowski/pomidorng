import { Component, Input, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PasswordEditor } from "/imports/ui/util/PasswordEditor";
import { DialogButtons } from "/imports/ui/util/dialog/DialogButtons";
import { StackLayout, StackPage } from "/imports/ui/util/StackLayout";
import { SubmittableDlg } from "/imports/ui/util/dialog/SubmittableDlg";

export interface ChangePasswordResult {
  currentPassword: string;
  newPassword: string;
}

@Component({
  selector: "change-password-dlg",
  standalone: true,
  imports: [FormsModule, SubmittableDlg, DialogButtons, PasswordEditor, StackLayout, StackPage],
  template: `
    <submittable-dlg title="Change Password">
      <form class="com-patrykmalinowski-pomidor-form" (ngSubmit)="onSubmit()">
        <input
          hidden
          readonly
          autocomplete="username"
          name="username"
          [value]="username"
        />
        @if (!isAdmin) {
          <label>
            Current Password:
            <password-editor
              name="currentPassword"
              autocomplete="current-password"
              [required]="true"
              [(ngModel)]="currentPassword"
            />
          </label>
        }
        <label>
          New Password:
          <password-editor
            name="newPassword"
            autocomplete="new-password"
            [required]="true"
            [(ngModel)]="password"
          />
        </label>
        <label>
          Confirm Password:
          <password-editor
            name="confirmPassword"
            autocomplete="new-password"
            [required]="true"
            [(ngModel)]="confirmPassword"
          />
        </label>
        <stack-layout [selection]="errorMessage">
          <stack-page id="passwords-do-not-match">
            <p class="com-patrykmalinowski-avocado-error-message">
              Passwords do not match.
            </p>
          </stack-page>
        </stack-layout>
        <dialog-buttons
          [show]="['ok', 'cancel']"
          (press)="onDlgButton($event)"
        ></dialog-buttons>
      </form>
    </submittable-dlg>
  `,
})
export class ChangePasswordDlg {
  @Input() isAdmin = false;
  @Input() username = "";

  @ViewChild(SubmittableDlg)
  private dialog!: SubmittableDlg<ChangePasswordResult>;

  errorMessage = "";
  password = "";
  currentPassword = "";
  confirmPassword = "";

  open(): Promise<ChangePasswordResult | null> {
    this.errorMessage = "";
    this.currentPassword = "";
    this.password = "";
    this.confirmPassword = "";
    return this.dialog.open();
  }

  onDlgButton(btn: string): void {
    if (btn === "cancel") {
      this.dialog.submit(null);
    }
  }

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = "passwords-do-not-match";
      return;
    }
    this.dialog.submit({
      currentPassword: this.currentPassword,
      newPassword: this.password,
    });
  }
}
