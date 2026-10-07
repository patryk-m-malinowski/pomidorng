import { CommonModule } from "@angular/common";
import { Component, Input, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { TASKS_CONSTANTS } from "/imports/common/TasksConstants";
import type { Task } from "/imports/data/tasks/Task";
import {
  DialogButtons,
  type ButtonKind,
} from "/imports/ui/util/dialog/DialogButtons";
import { SubmittableDlg } from "/imports/ui/util/dialog/SubmittableDlg";

export type EditTaskDlgMode = "new" | "edit";

@Component({
  selector: "edit-task-dlg",
  standalone: true,
  imports: [CommonModule, FormsModule, SubmittableDlg, DialogButtons],
  template: `
    <submittable-dlg [title]="mode === 'new' ? 'New Task' : 'Edit Task'">
      @if (task; as currentTask) {
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

            @if (error) {
              <p class="com-patrykmalinowski-avocado-error-message">
                {{ error }}
              </p>
            }
          </div>

          @if (mode === "edit") {
            <label class="flex gap-1 items-center">
              Created by:
              <span>{{ currentTask.createdBy || "Unknown" }}</span>
            </label>
          }

          <label>
            Assigned to:
            <input
              type="text"
              name="assignedTo"
              placeholder="Unassigned"
              [(ngModel)]="currentTask.assignedTo"
            />
          </label>

          <dialog-buttons
            [show]="mode === 'new' ? ['ok', 'cancel'] : ['close']"
            (press)="onDlgButton($event)"
          ></dialog-buttons>
        </div>
      }
    </submittable-dlg>
  `,
})
export class EditTaskDlg {
  @ViewChild(SubmittableDlg)
  private dialog!: SubmittableDlg<Task>;

  readonly TASKS_CONSTANTS = TASKS_CONSTANTS;

  @Input() mode: EditTaskDlgMode = "edit";
  @Input() task: Task | null = null;
  error = "";

  async open(mode: EditTaskDlgMode, task: Task): Promise<void> {
    this.error = "";
    this.task = task;
    this.mode = mode;
    await this.dialog.open();
    this.task = null;
  }

  onDlgButton(btn: ButtonKind): void {
    if (btn === "cancel") {
      this.dialog.submit(null);
      return;
    }

    this.submitTask();
  }

  private submitTask(): void {
    if (!this.task) {
      this.dialog.submit(null);
      return;
    }

    if (!this.task.title?.trim()) {
      this.error = "Title is required";
      return;
    }

    if (!this.task.assignedTo?.trim()) {
      this.task.assignedTo = null;
    }

    this.dialog.submit(this.task);
  }
}
