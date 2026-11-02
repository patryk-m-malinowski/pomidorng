import { Component, inject, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import UserService from "#pomidor/ui/UserService";
import { UserProfileEditor } from "./UserProfileEditor";

/**
 * A component that allows the user to edit their own profile.
 */
@Component({
  selector: "my-profile-editor",
  standalone: true,
  imports: [RouterLink, UserProfileEditor],
  host: { class: "block p-2" },
  template: `
    <div class="h-full">
      @if (loading()) {
        <p>Loading...</p>
      } @else if (userService.user(); as user) {
        <user-profile-editor [value]="user" />
      } @else {
        <p>
          You are a guest.
          <a routerLink="/">Click here to log in.</a>
        </p>
      }
    </div>
  `,
})
export class MyProfileEditor implements OnInit {
  readonly loading = signal(true);
  ngOnInit(): void {
    Meteor.subscribe("users.allUsers", {
      onReady: () => this.loading.set(false),
      onStop: () => this.loading.set(false),
    });
  }
  readonly userService = inject(UserService);
}
