import { CommonModule } from "@angular/common";
import { Component, signal, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { MatIcon } from "@angular/material/icon";
import { CursorTooltip } from "#pomidor/ui/util/CursorTooltip";
import { SelectUserDlg } from "#pomidor/ui/users/SelectUserDlg";
import { UserField } from "./UserField";
import { TASKS_CONSTANTS } from "#pomidor/common/TasksConstants";
import type { Task } from "#pomidor/data/tasks/Task";
import {
  DialogButtons,
  type ButtonKind,
} from "#pomidor/ui/util/dialog/DialogButtons";
import { SubmittableDlg } from "#pomidor/ui/util/dialog/SubmittableDlg";

export type EditTaskDlgMode = "new" | "edit";

@Component({
  selector: "pom-edit-task-dlg",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SubmittableDlg,
    DialogButtons,
    UserField,
    SelectUserDlg,
    MatIcon,
    CursorTooltip,
  ],
  template: `
    <pom-submittable-dlg [title]="mode() === 'new' ? 'New Task' : 'Edit Task'">
      @if (task(); as currentTask) {
        <div class="flex flex-col gap-2.5">
          <div class="com-patrykmalinowski-pomidor-form">
            <label>
              Title:
              <input
                type="text"
                name="title"
                [maxLength]="TASKS_CONSTANTS.MAX_TITLE_LENGTH"
                required
                [(ngModel)]="currentTask.title"
              />
            </label>

            <label>
              Extended Description (optional):
              <textarea
                class="min-h-50"
                name="description"
                [maxLength]="TASKS_CONSTANTS.MAX_DESCRIPTION_LENGTH"
                [(ngModel)]="currentTask.description"
              ></textarea>
            </label>

            @if (error()) {
              <p class="com-patrykmalinowski-avocado-error-message">
                {{ error() }}
              </p>
            }
          </div>

          @if (mode() === "edit") {
            <label class="flex gap-1 items-center">
              Created by:
              @if (currentTask.createdBy; as createdBy) {
                <pom-user-field [userId]="createdBy" [showIcon]="true" />
              } @else {
                <span>Unknown</span>
              }
            </label>
          }

          <div class="flex gap-1 items-center">
            Assigned to:
            <div class="flex gap-1 items-center justify-start w-64">
              <div class="flex-1 overflow-hidden">
                @if (currentTask.assignedTo; as assignedTo) {
                  <pom-user-field [userId]="assignedTo" [showIcon]="true" />
                } @else {
                  <span class="italic">Unassigned</span>
                }
              </div>
              <button
                type="button"
                aria-label="Select User"
                cursorTooltip="Select User"
                (click)="selectUser(currentTask)"
              >
                <mat-icon>edit</mat-icon>
              </button>
              @if (currentTask.assignedTo) {
                <button
                  type="button"
                  aria-label="Unassign User"
                  cursorTooltip="Unassign User"
                  (click)="currentTask.assignedTo = null"
                >
                  <mat-icon>close</mat-icon>
                </button>
              }
            </div>
          </div>

          <pom-dialog-buttons
            [show]="mode() === 'new' ? ['ok', 'cancel'] : ['close']"
            (press)="onDlgButton($event)"
          ></pom-dialog-buttons>
        </div>
      }
    </pom-submittable-dlg>
    <pom-select-user-dlg />
  `,
})
export class EditTaskDlg {
  @ViewChild(SelectUserDlg)
  private selectUserDlg!: SelectUserDlg;

  @ViewChild(SubmittableDlg)
  private dialog!: SubmittableDlg<boolean>;

  readonly TASKS_CONSTANTS = TASKS_CONSTANTS;

  readonly mode = signal<EditTaskDlgMode>("edit");
  readonly task = signal<Task | null>(null);
  readonly error = signal("");

  async open(mode: EditTaskDlgMode, task: Task): Promise<boolean> {
    this.error.set("");
    this.task.set(task);
    this.mode.set(mode);
    let result = await this.dialog.open();
    this.task.set(null);
    return !!result;
  }

  async selectUser(task: Task): Promise<void> {
    const userId = await this.selectUserDlg.open();
    if (userId) {
      task.assignedTo = userId;
    }
  }

  onDlgButton(btn: ButtonKind): void {
    if (btn === "cancel") {
      this.dialog.submit(false);
      return;
    }

    this.submitTask();
  }

  private submitTask(): void {
    const task = this.task();
    if (!task) {
      this.dialog.submit(false);
      return;
    }

    if (!task.title?.trim()) {
      this.error.set("Title is required");
      return;
    }

    this.dialog.submit(true);
  }
}
