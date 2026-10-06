import { CommonModule } from "@angular/common";
import { Component, effect, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Meteor } from "meteor/meteor";
import { Router } from "@angular/router";
import UserService from "./UserService";
import { CentralBox } from "./util/centralbox.component";
import { PasswordEditor } from "./util/passwordeditor.component";
import { StackLayout, StackPage } from "./util/stacklayout.component";

@Component({
  selector: "login-form",
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
        <h2 class="text-center font-bold">Welcome to Pomidor!</h2>
        <p>
          New here? Read the
          <a
            href="/introduction"
            (click)="$event.preventDefault(); openIntroduction()"
            >introduction</a
          >.
        </p>

        <div>
          @if (userService.user(); as currentUser) {
            <label class="flex gap-1 items-center">
              <input
                type="radio"
                name="login-method"
                [checked]="loginMethod === 'continue'"
                (change)="loginMethod = 'continue'"
              />
              Continue as {{ currentUser.username }}
            </label>
          }

          <label class="flex gap-1 items-center">
            <input
              type="radio"
              name="login-method"
              [checked]="loginMethod === 'spectator'"
              (change)="loginMethod = 'spectator'"
            />
            Log in as spectator
          </label>

          <label class="flex gap-1 items-center">
            <input
              type="radio"
              name="login-method"
              [checked]="loginMethod === 'user'"
              (change)="loginMethod = 'user'"
            />
            Log in with account
          </label>
        </div>

        <stack-layout [selection]="loginMethod">
          <stack-page id="continue">
            <button
              type="button"
              (click)="navigateToApp()"
              class="justify-center w-full"
            >
              Continue
            </button>
          </stack-page>

          <stack-page id="user">
            <form
              class="com-patrykmalinowski-pomidor-form"
              (ngSubmit)="onSubmit()"
            >
              <label>
                Username:
                <input
                  type="text"
                  name="username"
                  autocomplete="username"
                  [(ngModel)]="username"
                  required
                />
              </label>

              <label>
                Password:
                <password-editor
                  name="password"
                  autocomplete="current-password"
                  [(ngModel)]="password"
                  required
                ></password-editor>
              </label>

              @switch (errorMessage) {
                @case ("invalid-username-password") {
                  <p class="com-patrykmalinowski-avocado-error-message">
                    The account matching the username and password does not
                    exist. Please make sure you've entered the details
                    correctly.
                  </p>
                }
                @case ("unknown-error") {
                  <p class="com-patrykmalinowski-avocado-error-message">
                    An unknown error occurred. Please try again later.
                  </p>
                }
              }

              <button class="justify-center" type="submit">Log In</button>
              <button
                type="button"
                class="com-patrykmalinowski-avocado-button-extra justify-center"
                (click)="openRegister()"
              >
                Create Account
              </button>
            </form>
          </stack-page>

          <stack-page id="spectator">
            <div class="flex flex-col gap-2">
              <p>
                You will be able to view the data but you won't be able to make
                any changes. If you want to make changes, please create an
                account (no personal information required).
              </p>
              <button
                type="button"
                (click)="onSpectatorLogin()"
                class="justify-center"
              >
                Log In
              </button>
            </div>
          </stack-page>
        </stack-layout>
      </div>
    </central-box>
  `,
  host: {
    class: "h-full",
  },
})
export class LoginFormComponent {
  readonly userService = inject(UserService);
  readonly router = inject(Router);

  username = "";
  password = "";
  errorMessage: string | null = null;
  loginMethod: "continue" | "user" | "spectator" = "continue";

  constructor() {
    effect(() => {
      const currentUser = this.userService.user();
      this.loginMethod = currentUser ? "continue" : "user";
    });
  }

  navigateToApp(): void {
    const page = window.localStorage.getItem("pomidor.selectedPage") ?? "tasks";
    this.router.navigateByUrl(`/app/${page}`);
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = null;

    const loginError = await new Promise<boolean>((resolve) => {
      Meteor.loginWithPassword(
        { username: this.username },
        this.password,
        (error) => {
          resolve(!!error);
        },
      );
    });

    if (loginError) {
      this.errorMessage = "invalid-username-password";
    } else {
      this.navigateToApp();
    }
  }

  onSpectatorLogin(): void {
    Meteor.logout(() => this.navigateToApp());
  }

  openRegister(): void {
    this.router.navigateByUrl("/register");
  }

  openIntroduction(): void {
    this.router.navigateByUrl("/introduction");
  }
}
