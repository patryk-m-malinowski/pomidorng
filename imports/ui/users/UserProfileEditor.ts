import { Component, computed, inject, input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { CursorTooltip } from "#pomidor/ui/util/CursorTooltip";
import { Accounts } from "meteor/accounts-base";
import dayjs from "dayjs";
import type { PomidorUser } from "#pomidor/data/users/PomidorUser";
import CommonDialogsService from "#pomidor/ui/util/dialog/CommonDialogsService";
import UserService from "#pomidor/ui/UserService";
import { ChangePasswordDlg } from "./ChangePasswordDlg";

/**
 * A component that allows the user to edit a system user's details.
 */
@Component({
  selector: "pom-user-profile-editor",
  standalone: true,
  imports: [MatIcon, CursorTooltip, ChangePasswordDlg],
  template: `
    <div class="flex flex-col gap-4">
      <div class="com-patrykmalinowski-avocado-toolbar">
        <button type="button" (click)="changePassword()">
          <mat-icon>key</mat-icon>Change Password
        </button>
        <button type="button" (click)="deleteAccount()">
          <mat-icon>close</mat-icon>Delete Account
        </button>
        <button type="button" (click)="logOut()">
          <mat-icon>logout</mat-icon>Log Out
        </button>
        @if (currentUser()?.isAdmin) {
          <button type="button" (click)="showConnectionInfo()">
            <mat-icon>link</mat-icon>Show Connection Info
          </button>
        }
      </div>
      <div class="max-w-100">
        <fieldset>
          <legend>Details</legend>
          <div class="com-patrykmalinowski-pomidor-form flex flex-col gap-1.5">
            <label>
              Username:
              <div class="flex gap-1.5 items-center">
                <input type="text" readonly [value]="value().username" />
                <button
                  type="button"
                  cursorTooltip="Change Username"
                  aria-label="Change Username"
                  (click)="changeUsername()"
                >
                  <mat-icon>edit</mat-icon>
                </button>
              </div>
            </label>
            <p>
              Date Joined:
              <span>{{ dateJoined() }}</span>
            </p>
          </div>
        </fieldset>
      </div>
    </div>
    <pom-change-password-dlg [isAdmin]="false" [username]="value().username" />
  `,
})
export class UserProfileEditor {
  readonly value = input.required<PomidorUser>();

  private readonly dialogsApi = inject(CommonDialogsService);
  private readonly router = inject(Router);
  readonly currentUser = inject(UserService).user;

  @ViewChild(ChangePasswordDlg) private changePasswordDlg!: ChangePasswordDlg;

  readonly dateJoined = computed(() =>
    dayjs(this.value().createdAt).format("DD/MM/YYYY"),
  );

  async changePassword(): Promise<void> {
    const userData = await this.changePasswordDlg.open();
    if (!userData) return;
    const { currentPassword, newPassword } = userData;
    try {
      await new Promise<void>((resolve, reject) => {
        Accounts.changePassword(currentPassword, newPassword, (err: any) =>
          err ? reject(err) : resolve(),
        );
      });
      this.dialogsApi.showInfo(
        "Password Changed",
        "Your password has been changed successfully.",
      );
    } catch (e: any) {
      if (e.error === 403) {
        this.dialogsApi.showError(
          "Failed to change password",
          "Wrong password entered.",
        );
      } else {
        throw e;
      }
    }
  }

  async changeUsername(): Promise<void> {
    const newUsername = await this.dialogsApi.showPrompt(
      "Change Username",
      "Enter your new username:",
      this.value().username,
    );
    if (!newUsername) return;

    const { error } = (await Meteor.callAsync(
      "users.setUsername",
      this.value()._id,
      newUsername,
    )) as { ok?: boolean; error?: string };

    if (error == "username-taken") {
      this.dialogsApi.showError(
        "Failed to change username",
        "This username is already taken. Please choose a different username.",
      );
    } else {
      this.dialogsApi.showInfo(
        "Username Changed",
        "Your username has been changed successfully.",
      );
    }
  }

  async deleteAccount(): Promise<void> {
    const confirm = await this.dialogsApi.showConfirmation(
      "Delete Account",
      "Are you sure you want to delete your account? Your account will be gone forever!",
    );
    if (confirm) {
      Meteor.callAsync("users.removeUser", this.value()._id);
      this.router.navigateByUrl("/");
    }
  }

  async logOut(): Promise<void> {
    const choice = await this.dialogsApi.showConfirmation(
      "Log Out",
      "Are you sure you want to log out?",
    );
    if (choice) {
      Meteor.logout();
      this.router.navigateByUrl("/");
    }
  }

  async showConnectionInfo(): Promise<void> {
    const data = await Meteor.callAsync("users.getConnectionInfo");
    this.dialogsApi.showInfo("Connection Info", JSON.stringify(data, null, 2));
  }
}
