import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Meteor } from "meteor/meteor";
import { Router } from "@angular/router";
import { USERS_CONSTANTS } from "/imports/common/UsersConstants";
import { CentralBox } from "./util/CentralBox";
import { PasswordEditor } from "./util/PasswordEditor";
import { StackLayout, StackPage } from "./util/StackLayout";

@Component({
  selector: "registration-form",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CentralBox,
    StackLayout,
    StackPage,
    PasswordEditor,
  ],
  template: `
    <central-box>
      <div class="flex flex-col items-stretch gap-2">
        <h2 class="text-center font-bold">Register</h2>

        <form class="com-patrykmalinowski-pomidor-form" (ngSubmit)="onSubmit()">
          <label>
            Username:
            <input
              type="text"
              name="username"
              autocomplete="username"
              [maxLength]="usersConstants.MAX_USERNAME_LENGTH"
              required
              [(ngModel)]="username"
            />
          </label>

          <label>
            Password:
            <password-editor
              name="password"
              autocomplete="current-password"
              [maxLength]="usersConstants.MAX_PASSWORD_LENGTH"
              required
              [(ngModel)]="password"
            ></password-editor>
          </label>

          <label>
            Confirm Password:
            <password-editor
              name="confirmPassword"
              autocomplete="current-password"
              [maxLength]="usersConstants.MAX_PASSWORD_LENGTH"
              required
              [(ngModel)]="confirmPassword"
            ></password-editor>
          </label>

          <p>By registering, please be aware that:</p>
          <ul>
            <li>
              Your username and any text you enter into the tasks will be
              publicly visible to other users. The author of this application
              accepts no responsibility for GDPR breaches or harm caused to
              users resulting from usage of this app. It is your responsibility
              that you do not enter anything confidential or inappropriate into
              this app.
            </li>
            <li>
              Your account and any other accounts you create will be deleted
              after 7 days of inactivity.
            </li>
          </ul>

          <div class="flex items-start gap-1.5">
            <input
              type="checkbox"
              name="acceptTerms"
              required
              [(ngModel)]="acceptedTerms"
            />
            <p>
              I have read and agree to the above conditions, and acknowledge the
              <a
                href="/privacy-policy"
                (click)="$event.preventDefault(); openPrivacyPolicy()"
                >privacy policy</a
              >.
            </p>
          </div>

          <stack-layout [selection]="errorMessage()">
            <stack-page id="username-taken">
              <p class="com-patrykmalinowski-avocado-error-message">
                The username is already taken. Please choose a different one.
              </p>
            </stack-page>
            <stack-page id="passwords-do-not-match">
              <p class="com-patrykmalinowski-avocado-error-message">
                Passwords do not match.
              </p>
            </stack-page>
            <stack-page id="account-limit-reached">
              <p class="com-patrykmalinowski-avocado-error-message">
                You have reached the limit of {{ accountLimit }} user accounts
                from your IP address. Please delete some of your accounts in
                order to be able to create more.
              </p>
            </stack-page>
            <stack-page id="unknown-error">
              <p class="com-patrykmalinowski-avocado-error-message">
                An unknown error occurred. Please try again later.
              </p>
            </stack-page>
          </stack-layout>

          <button type="submit" class="justify-center">Register!</button>
          <button
            type="button"
            class="com-patrykmalinowski-avocado-button-extra justify-center"
            (click)="openLogin()"
          >
            Login as existing user
          </button>
        </form>
      </div>
    </central-box>
  `,
  host: {
    class: "h-full",
  },
})
export class RegistrationForm {
  readonly router = inject(Router);

  username = "";
  password = "";
  confirmPassword = "";
  acceptedTerms = false;
  errorMessage = signal<string | null>(null);

  readonly usersConstants = USERS_CONSTANTS;
  readonly accountLimit =
    (Meteor.settings as { public?: { users?: { maxAccountsPerIp?: number } } })
      ?.public?.users?.maxAccountsPerIp ?? 0;

  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set("passwords-do-not-match");
      return;
    }

    const result = (await Meteor.callAsync("users.createUser", {
      username: this.username,
      password: this.password,
      playgroundUser: false,
    })) as { error?: string } | undefined;

    if (result?.error) {
      this.errorMessage.set(result.error);
      return;
    }

    Meteor.loginWithPassword(
      { username: this.username },
      this.password,
      (error) => {
        if (error) {
          this.errorMessage.set("unknown-error");
        } else {
          window.setTimeout(() => this.navigateToApp(), 100);
        }
      },
    );
  }

  navigateToApp(): void {
    // const page = window.localStorage.getItem("pomidor.selectedPage") ?? "tasks";//!todo check
    // this.router.navigateByUrl(`/pomidorapp/${page}`);
    this.router.navigateByUrl(`/pomidorapp/`);
  }

  openLogin(): void {
    this.router.navigateByUrl("/");
  }

  openPrivacyPolicy(): void {
    this.router.navigateByUrl("/privacy-policy");
  }
}
