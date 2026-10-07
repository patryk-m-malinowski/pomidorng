import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { Meteor } from "meteor/meteor";

import type { Task } from "/imports/data/tasks/Task";

@Component({
  selector: "task-box",
  standalone: true,
  imports: [CommonModule, MatIcon],
  template: `
    <div
      class="com-patrykmalinowski-pomidor-tasks-editor-task-box flex flex-col gap-2.5 p-2"
    >
      <div class="com-patrykmalinowski-avocado-toolbar">
        <button
          type="button"
          aria-label="Move to left column"
          [disabled]="!user || task.status === 'todo'"
          (click)="moveTaskLeft()"
        >
          <mat-icon>arrow_back</mat-icon>
        </button>

        <button
          type="button"
          aria-label="Edit task"
          [disabled]="!user"
          (click)="onEditClicked()"
        >
          <mat-icon>edit</mat-icon>
        </button>

        <button
          type="button"
          aria-label="Delete Task"
          [disabled]="!user"
          (click)="onDeleteClicked()"
        >
          <mat-icon>delete</mat-icon>
        </button>

        <button
          type="button"
          aria-label="Move to right column"
          [disabled]="!user || task.status === 'done'"
          (click)="moveTaskRight()"
        >
          <mat-icon>arrow_forward</mat-icon>
        </button>
      </div>

      <h3 class="font-bold text-xl">{{ task.title }}</h3>

      @if (task.assignedTo) {
        <div class="flex items-center gap-1">
          <mat-icon>person</mat-icon>
          <span>{{ task.assignedTo }}</span>
        </div>
      } @else {
        <div class="flex items-center gap-1">
          <mat-icon>account_circle</mat-icon>
          <i>Unassigned</i>
        </div>
      }

      <p class="overflow-hidden whitespace-nowrap text-ellipsis">
        {{ task.description }}
      </p>
    </div>
  `,
})
export class TaskBox {
  @Input({ required: true }) task!: Task;
  @Input({ required: true }) editTask!: (task: Task) => Promise<void>;
  @Input({ required: true }) deleteTask!: (task: Task) => void;

  readonly statusOrder: Task["status"][] = ["todo", "inProgress", "done"];

  get user() {
    return Meteor.user();
  }

  moveTaskLeft(): void {
    const index = this.statusOrder.indexOf(this.task.status);
    const nextStatus = this.statusOrder[index - 1];
    if (nextStatus) {
      this.task.status = nextStatus;
      this.task.dateModified = new Date();
    }
  }

  moveTaskRight(): void {
    const index = this.statusOrder.indexOf(this.task.status);
    const nextStatus = this.statusOrder[index + 1];
    if (nextStatus) {
      this.task.status = nextStatus;
      this.task.dateModified = new Date();
    }
  }

  async onEditClicked(): Promise<void> {
    await this.editTask(this.task);
  }

  onDeleteClicked(): void {
    this.deleteTask(this.task);
  }
}
