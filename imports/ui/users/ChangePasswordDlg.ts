import { Component, Input, signal, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PasswordEditor } from "#pomidor/ui/util/PasswordEditor";
import { DialogButtons } from "#pomidor/ui/util/dialog/DialogButtons";
import { StackLayout, StackPage } from "#pomidor/ui/util/StackLayout";
import { SubmittableDlg } from "#pomidor/ui/util/dialog/SubmittableDlg";

export interface ChangePasswordResult {
  currentPassword: string;
  newPassword: string;
}

@Component({
  selector: "pom-change-password-dlg",
  standalone: true,
  imports: [
    FormsModule,
    SubmittableDlg,
    DialogButtons,
    PasswordEditor,
    StackLayout,
    StackPage,
  ],
  template: `
    <pom-submittable-dlg title="Change Password">
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
            <pom-password-editor
              name="currentPassword"
              autocomplete="current-password"
              [required]="true"
              [(ngModel)]="currentPassword"
            />
          </label>
        }
        <label>
          New Password:
          <pom-password-editor
            name="newPassword"
            autocomplete="new-password"
            [required]="true"
            [(ngModel)]="password"
          />
        </label>
        <label>
          Confirm Password:
          <pom-password-editor
            name="confirmPassword"
            autocomplete="new-password"
            [required]="true"
            [(ngModel)]="confirmPassword"
          />
        </label>
        <pom-stack-layout [selection]="errorMessage()">
          <pom-stack-page id="passwords-do-not-match">
            <p class="com-patrykmalinowski-avocado-error-message">
              Passwords do not match.
            </p>
          </pom-stack-page>
        </pom-stack-layout>
        <pom-dialog-buttons
          [show]="['ok', 'cancel']"
          (press)="onDlgButton($event)"
        ></pom-dialog-buttons>
      </form>
    </pom-submittable-dlg>
  `,
})
export class ChangePasswordDlg {
  @Input() isAdmin = false;
  @Input() username = "";

  @ViewChild(SubmittableDlg)
  private dialog!: SubmittableDlg<ChangePasswordResult>;

  readonly errorMessage = signal("");
  readonly password = signal("");
  readonly currentPassword = signal("");
  readonly confirmPassword = signal("");

  open(): Promise<ChangePasswordResult | null> {
    this.errorMessage.set("");
    this.currentPassword.set("");
    this.password.set("");
    this.confirmPassword.set("");
    return this.dialog.open();
  }

  onDlgButton(btn: string): void {
    if (btn === "cancel") {
      this.dialog.submit(null);
    }
  }

  onSubmit(): void {
    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set("passwords-do-not-match");
      return;
    }
    this.dialog.submit({
      currentPassword: this.currentPassword(),
      newPassword: this.password(),
    });
  }
}
