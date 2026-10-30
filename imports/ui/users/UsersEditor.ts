import { CommonModule } from "@angular/common";
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import type { Subscription } from "rxjs";
import { Tracker } from "meteor/tracker";
import { MatIcon } from "@angular/material/icon";
import { pomidorUsers } from "#pomidor/db/users/PomidorUsers";
import { PomidorUser } from "#pomidor/data/users/PomidorUser";
import type { ServerPojo } from "#pomidor/common/mso/ObjectsPool";
import { PoolFactory } from "#pomidor/common/mso/PoolFactory";
import { formatDate } from "#pomidor/util/PomidorGlobals";
import CommonDialogsService from "/imports/ui/util/dialog/CommonDialogsService";
import UserService from "/imports/ui/UserService";
import {
  Column,
  Columns,
  PomidorTable,
  Row,
} from "/imports/ui/util/table/PomidorTable";
import { UserEditor } from "./UserEditor";
import { NewUserDialog } from "./NewUserDialog";
import { ChangePasswordDlg } from "./ChangePasswordDlg";

@Component({
  selector: "users-editor",
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    UserEditor,
    NewUserDialog,
    ChangePasswordDlg,
    PomidorTable,
    Columns,
    Column,
    Row,
  ],
  host: { class: "block h-full" },
  template: `
    @if (loading()) {
      <p>Loading...</p>
    } @else {
      <!-- Mobile: either the list or the details of the selected user -->
      <div class="lg:hidden h-full">
        <ng-container *ngTemplateOutlet="mobileDetails" />
      </div>

      <!-- Desktop: list and details side by side -->
      <div class="hidden lg:block h-full">
        <ng-container *ngTemplateOutlet="desktopDetails" />
      </div>
    }
    <new-user-dlg #newUserDlg />
    <change-password-dlg
      #changePasswordDlg
      [isAdmin]="true"
      [username]="selectedUser()?.username ?? ''"
    />
    <ng-template #mobileDetails>
      @if (detailsUserId()) {
        <div class="flex h-full flex-col gap-2 p-1.5 overflow-y-auto">
          <div>
            <button type="button" (click)="closeDetails()">
              <mat-icon>arrow_back</mat-icon>Go Back
            </button>
          </div>
          <div class="flex-1">
            @if (detailsUser(); as user) {
              <user-editor [value]="user" />
            } @else {
              <p>User not found</p>
            }
          </div>
        </div>
      } @else {
        <ng-container *ngTemplateOutlet="toolbarAndTable" />
      }
    </ng-template>

    <ng-template #desktopDetails>
      <div
        class="com-patrykmalinowski-pomidor-users-editor-desktop flex flex-row h-full"
      >
        <div class="flex flex-col gap-1.5 p-1.5 w-125">
          <ng-container *ngTemplateOutlet="toolbarAndTable" />
        </div>
        @if (selectedUser(); as user) {
          <div class="flex-1 flex">
            <div
              class="com-patrykmalinowski-pomidor-users-editor__separator h-full w-1"
            ></div>
            <div
              class="com-patrykmalinowski-pomidor-users-editor__editor-container flex-1 p-2"
            >
              <user-editor [value]="user" />
            </div>
          </div>
        }
      </div>
    </ng-template>

    <ng-template #toolbarAndTable>
      <div class="h-full min-h-0 flex flex-col gap-1.5 p-1.5">
        <div class="com-patrykmalinowski-avocado-toolbar">
          <button [disabled]="!appUser()" (click)="onCreateUserPressed()">
            <mat-icon>add</mat-icon>
            Create User
          </button>
          <button [disabled]="!canModifyUser()" (click)="onDeleteUserPressed()">
            <mat-icon>delete</mat-icon>
            Delete User
          </button>
          <button
            [disabled]="!canModifyUser()"
            (click)="onChangePasswordPressed()"
          >
            <mat-icon>key</mat-icon>
            Change Password
          </button>
          <button
            class="lg:hidden!"
            [disabled]="!selectedUser()"
            (click)="openDetails()"
          >
            <mat-icon>open_in_new</mat-icon> View Details
          </button>
        </div>

        <div class="flex-1 min-h-0">
          <pomidor-table
            [selection]="selectedUserId() ? [selectedUserId()!] : []"
            selectionMode="single"
            (selectionChange)="selectedUserId.set($event[0] ?? null)"
          >
            <pomidor-columns>
              <pomidor-column id="username" title="Username" [width]="180" />
              <pomidor-column id="playgroundUser" title="Playground User" />
              <pomidor-column id="createdAt" title="Date Joined" />
              <pomidor-column id="lastLogin" title="Last Login" />
            </pomidor-columns>
            @for (user of users(); track user._id) {
              <pomidor-row [id]="user._id">
                <td class="overflow-hidden">{{ user.username }}</td>
                <td>{{ user.playgroundUser ? "Yes" : "No" }}</td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  {{
                    user.lastLogin ? formatDate(user.lastLogin, true) : "Never"
                  }}
                </td>
              </pomidor-row>
            }
          </pomidor-table>
        </div>
      </div>
    </ng-template>
  `,
})
export class UsersEditor implements OnInit, OnDestroy {
  private readonly dialogsApi = inject(CommonDialogsService);
  readonly appUser = inject(UserService).user;
  private readonly router = inject(Router);
  private routerSub: Subscription | null = null;

  private usersSub: Meteor.SubscriptionHandle | null = null;
  private tracker: Tracker.Computation | null = null;

  @ViewChild("newUserDlg") private newUserDlg?: NewUserDialog;
  @ViewChild("changePasswordDlg") private changePasswordDlg?: ChangePasswordDlg;

  readonly formatDate = formatDate;
  readonly loading = signal(true);
  /**
   * ID of the user whose details are shown (from /pomidorapp/users/:id), or null for the list
   */
  readonly detailsUserId = signal<string | null>(this.parseUserIdFromUrl());
  readonly selectedUserId = signal<string | null>(null);

  /**
   * All users shown in the table, sorted by username
   */
  readonly users = signal<PomidorUser[]>([]);

  readonly selectedUser = computed<PomidorUser | null>(
    () => this.users().find((u) => u._id === this.selectedUserId()) ?? null,
  );

  readonly detailsUser = computed<PomidorUser | null>(
    () => this.users().find((u) => u._id === this.detailsUserId()) ?? null,
  );

  readonly canModifyUser = computed(() => {
    const selected = this.selectedUser();
    const app = this.appUser();
    return !!selected && !!app && (app.isAdmin || selected.playgroundUser);
  });

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.detailsUserId.set(this.parseUserIdFromUrl());
      }
    });

    this.usersSub = Meteor.subscribe("users.allUsers", {
      onReady: () => this.loading.set(false),
      onStop: () => this.loading.set(false),
    });

    this.tracker = Tracker.autorun(() => {
      const pojos = pomidorUsers.find({}).fetch() as unknown as ServerPojo[];
      if (this.loading()) return;
      const users = pojos.map((pojo) =>
        PoolFactory.instance.getPool(PomidorUser).get(pojo),
      );
      users.sort((a, b) => a.username.localeCompare(b.username));
      this.users.set(users);
    });
  }

  ngOnDestroy(): void {
    this.usersSub?.stop();
    this.tracker?.stop();
    this.routerSub?.unsubscribe();
  }

  private parseUserIdFromUrl(): string | null {
    const path = this.router.url.split(/[?#]/)[0];
    return path.match(/^\/pomidorapp\/users\/([^/]+)$/)?.[1] ?? null;
  }

  openDetails(): void {
    const user = this.selectedUser();
    if (user) {
      void this.router.navigateByUrl(`/pomidorapp/users/${user._id}`);
    }
  }

  closeDetails(): void {
    this.router.navigateByUrl("/pomidorapp/users");
  }

  async onCreateUserPressed(): Promise<void> {
    const userId = await this.newUserDlg!.open();
    if (userId) {
      this.selectedUserId.set(userId);
    }
  }

  async onDeleteUserPressed(): Promise<void> {
    const user = this.selectedUser();
    if (!user) return;
    const confirm = await this.dialogsApi.showConfirmation(
      "Delete User",
      "Are you sure you want to delete this user? This could have very serious consequences so please ensure you know exactly what you're doing!",
    );
    if (!confirm) return;

    await Meteor.callAsync("users.removeUser", user._id);
  }

  async onChangePasswordPressed(): Promise<void> {
    const user = this.selectedUser();
    if (!user) return;
    const userData = await this.changePasswordDlg!.open();
    if (!userData) return;
    await Meteor.callAsync(
      "users.changePassword",
      user._id,
      userData.newPassword,
    );
    await this.dialogsApi.showInfo(
      "Password changed",
      "Password changed successfully",
    );
  }
}
