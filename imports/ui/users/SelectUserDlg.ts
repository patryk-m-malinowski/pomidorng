import { Component, OnDestroy, OnInit, ViewChild, signal } from "@angular/core";
import { Tracker } from "meteor/tracker";
import { pomidorUsers } from "#pomidor/db/users/PomidorUsers";
import { PomidorUser } from "#pomidor/data/users/PomidorUser";
import type { ServerPojo } from "#pomidor/common/mso/ObjectsPool";
import { PoolFactory } from "#pomidor/common/mso/PoolFactory";
import { UserField } from "#pomidor/ui/tasksEditor/UserField";
import { DialogButtons } from "#pomidor/ui/util/dialog/DialogButtons";
import { SubmittableDlg } from "#pomidor/ui/util/dialog/SubmittableDlg";

/**
 * A dialog which allows the user to select a user from the system.
 */
@Component({
  selector: "pom-select-user-dlg",
  standalone: true,
  imports: [SubmittableDlg, DialogButtons, UserField],
  template: `
    <pom-submittable-dlg title="Select User">
      <div class="flex flex-col gap-2.5">
        <div
          class="com-patrykmalinowski-pomidor-users-list overflow-y-scroll flex flex-col max-h-75"
        >
          @for (user of users(); track user._id) {
            <div
              class="com-patrykmalinowski-pomidor-users-list__item flex cursor-pointer flex-col gap-1 p-1"
              (mousedown)="dialog.submit(user._id)"
            >
              <pom-user-field
                className="min-w-32"
                [userId]="user._id"
                [showIcon]="true"
              />
            </div>
          }
        </div>
        <pom-dialog-buttons [show]="['cancel']" (press)="dialog.submit(null)" />
      </div>
    </pom-submittable-dlg>
  `,
})
export class SelectUserDlg implements OnInit, OnDestroy {
  @ViewChild(SubmittableDlg, { static: true })
  dialog!: SubmittableDlg<string>;

  readonly users = signal<PomidorUser[]>([]);
  private tracker: Tracker.Computation | null = null;

  ngOnInit(): void {
    this.tracker = Tracker.autorun(() => {
      const handle = Meteor.subscribe("users.allUsers");
      const pojos = pomidorUsers.find({}).fetch() as unknown as ServerPojo[];
      this.users.set(
        pojos.map((pojo) =>
          PoolFactory.instance.getPool(PomidorUser).createOrUpdate(pojo),
        ),
      );
    });
  }

  ngOnDestroy(): void {
    this.tracker?.stop();
  }

  /**
   * @returns The selected user ID, or null if cancelled.
   */
  open(): Promise<string | null> {
    return this.dialog.open();
  }
}
