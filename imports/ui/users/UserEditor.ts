import { Component, computed, inject, input, Signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { PomidorUser } from "/imports/data/users/PomidorUser";
import { CheckBox } from "/imports/ui/util/CheckBox";
import UserService from "/imports/ui/UserService";
import { formatDate } from "/imports/util/PomidorGlobals";

@Component({
  selector: "user-editor",
  standalone: true,
  imports: [FormsModule, CheckBox],
  template: `
    <div class="flex flex-col gap-4 max-w-100">
      <fieldset class="com-patrykmalinowski-pomidor-form">
        <legend>Details</legend>
        <check-box
          label="Admin"
          [disabled]="!canEditAdmin()"
          [readOnly]="!!currentUser() && !currentUser()!.isAdmin"
          [(ngModel)]="value().isAdmin"
        />
        <label>
          Username:
          <input readonly type="text" [value]="value().username" />
        </label>
        <label>
          Date Joined:
          <input readonly type="text" [value]="createdAt()" />
        </label>
        <label>
          Last Logged In:
          <input readonly type="text" [value]="lastLogin()" />
        </label>
      </fieldset>
    </div>
  `,
})
export class UserEditor {
  readonly value = input.required<PomidorUser>();
  private readonly userService = inject(UserService);
  readonly currentUser: Signal<PomidorUser | null> = this.userService.user;

  readonly canEditAdmin = computed(() => {
    const current = this.userService.user();
    return !!current && current._id !== this.value()._id && !!current.isAdmin;
  });
  readonly createdAt = computed(() => {
    const date = this.value().createdAt;
    return date ? formatDate(date) : "";
  });
  readonly lastLogin = computed(() => {
    const date = this.value().lastLogin;
    return date ? formatDate(date, true) : "Never";
  });
}
