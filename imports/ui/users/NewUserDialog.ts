import { Component, signal, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { USERS_CONSTANTS } from "#pomidor/common/UsersConstants";
import { PasswordEditor } from "#pomidor/ui/util/PasswordEditor";
import { DialogButtons } from "#pomidor/ui/util/dialog/DialogButtons";
import { StackLayout, StackPage } from "#pomidor/ui/util/StackLayout";
import { SubmittableDlg } from "#pomidor/ui/util/dialog/SubmittableDlg";

/**
 * A dialog that allows the user to create a new user.
 */
@Component({
  selector: "pom-new-user-dlg",
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
    <pom-submittable-dlg title="New User">
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
          <pom-password-editor
            name="password"
            autocomplete="new-password"
            [required]="true"
            [maxLength]="USERS_CONSTANTS.MAX_PASSWORD_LENGTH"
            [(ngModel)]="password"
          />
        </label>
        <label>
          Confirm Password:
          <pom-password-editor
            name="confirmPassword"
            autocomplete="new-password"
            [required]="true"
            [maxLength]="USERS_CONSTANTS.MAX_PASSWORD_LENGTH"
            [(ngModel)]="confirmPassword"
          />
        </label>
        <pom-stack-layout [selection]="errorMessage()">
          <pom-stack-page id="passwords-do-not-match">
            <p class="com-patrykmalinowski-avocado-error-message">
              Passwords do not match.
            </p>
          </pom-stack-page>
          <pom-stack-page id="username-taken">
            <p class="com-patrykmalinowski-avocado-error-message">
              The username is already taken. Please choose a different one.
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
export class NewUserDialog {
  @ViewChild(SubmittableDlg)
  private dialog!: SubmittableDlg<string>;

  readonly USERS_CONSTANTS = USERS_CONSTANTS;

  readonly username = signal("");
  readonly password = signal("");
  readonly confirmPassword = signal("");
  readonly errorMessage = signal("");

  /**
   * @returns The user ID if one was created, null if not
   */
  async open(): Promise<string | null> {
    this.username.set("");
    this.password.set("");
    this.confirmPassword.set("");
    this.errorMessage.set("");
    return await this.dialog.open();
  }

  onDlgButton(btn: string): void {
    if (btn === "cancel") {
      this.dialog.submit(null);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set("passwords-do-not-match");
      return;
    }

    const result = (await Meteor.callAsync("users.createUser", {
      username: this.username(),
      password: this.password(),
      playgroundUser: true,
    })) as { error?: string; userId?: string };
    if (result.error) {
      this.errorMessage.set(result.error);
      return;
    }
    this.dialog.submit(result.userId ?? null);
  }
}
