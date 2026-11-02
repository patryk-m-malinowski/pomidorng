import { Component, computed, inject, input, Signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { PomidorUser } from "#pomidor/data/users/PomidorUser";
import { CheckBox } from "#pomidor/ui/util/CheckBox";
import UserService from "#pomidor/ui/UserService";
import { formatDate } from "#pomidor/util/PomidorGlobals";

@Component({
  selector: "pom-user-editor",
  standalone: true,
  imports: [FormsModule, CheckBox],
  template: `
    <div class="flex flex-col gap-4 max-w-100">
      <fieldset class="com-patrykmalinowski-pomidor-form">
        <legend>Details</legend>
        <p>
          Username:
          <span>{{ value().username }}</span>
        </p>
        <p>
          Playground User:
          <span>{{ value().playgroundUser ? "Yes" : "No" }}</span>
        </p>
        <p>
          Date Joined:
          <span>{{ createdAt() }}</span>
        </p>
        <p>
          Last Logged In:
          <span>{{ lastLogin() }}</span>
        </p>
        <pom-check-box
          label="Admin"
          [disabled]="!canEditAdmin()"
          [readOnly]="!!currentUser() && !currentUser()!.isAdmin"
          [(ngModel)]="value().isAdmin"
        />
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
