import { Component, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { USERS_CONSTANTS } from "/imports/common/UsersConstants";
import { PasswordEditor } from "/imports/ui/util/PasswordEditor";
import { DialogButtons } from "/imports/ui/util/dialog/DialogButtons";
import { StackLayout, StackPage } from "/imports/ui/util/StackLayout";
import { SubmittableDlg } from "/imports/ui/util/dialog/SubmittableDlg";

/**
 * A dialog that allows the user to create a new user.
 */
@Component({
  selector: "new-user-dlg",
  standalone: true,
  imports: [FormsModule, SubmittableDlg, DialogButtons, PasswordEditor, StackLayout, StackPage],
  template: `
    <submittable-dlg title="New User">
      <form
        class="com-patrykmalinowski-pomidor-form flex flex-col gap-1.5 max-w-96"
        (ngSubmit)="onSubmit()"
      >
        <label>
          Username:
          <input
            type="text"
            name="username"
            autocomplete="username"
            required
            [maxLength]="USERS_CONSTANTS.MAX_USERNAME_LENGTH"
            [(ngModel)]="username"
          />
        </label>
        <label>
          Password:
          <password-editor
            name="password"
            autocomplete="new-password"
            [required]="true"
            [maxLength]="USERS_CONSTANTS.MAX_PASSWORD_LENGTH"
            [(ngModel)]="password"
          />
        </label>
        <label>
          Confirm Password:
          <password-editor
            name="confirmPassword"
            autocomplete="new-password"
            [required]="true"
            [maxLength]="USERS_CONSTANTS.MAX_PASSWORD_LENGTH"
            [(ngModel)]="confirmPassword"
          />
        </label>
        <stack-layout [selection]="errorMessage">
          <stack-page id="passwords-do-not-match">
            <p class="com-patrykmalinowski-avocado-error-message">
              Passwords do not match.
            </p>
          </stack-page>
          <stack-page id="username-taken">
            <p class="com-patrykmalinowski-avocado-error-message">
              The username is already taken. Please choose a different one.
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
export class NewUserDialog {
  @ViewChild(SubmittableDlg)
  private dialog!: SubmittableDlg<string>;

  readonly USERS_CONSTANTS = USERS_CONSTANTS;

  username = "";
  password = "";
  confirmPassword = "";
  errorMessage = "";

  /**
   * @returns The user ID if one was created, null if not
   */
  async open(): Promise<string | null> {
    this.username = "";
    this.password = "";
    this.confirmPassword = "";
    this.errorMessage = "";
    return await this.dialog.open();
  }

  onDlgButton(btn: string): void {
    if (btn === "cancel") {
      this.dialog.submit(null);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = "passwords-do-not-match";
      return;
    }

    const result = (await Meteor.callAsync("users.createUser", {
      username: this.username,
      password: this.password,
      playgroundUser: true,
    })) as { error?: string; userId?: string };
    if (result.error) {
      this.errorMessage = result.error;
      return;
    }
    this.dialog.submit(result.userId ?? null);
  }
}
