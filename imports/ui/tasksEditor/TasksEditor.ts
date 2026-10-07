import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from "@angular/core";

import type { Task } from "/imports/data/tasks/Task";
import TasksService from "./TasksService";
import { TaskBox } from "/imports/ui/tasksEditor/TaskBox";
import { TasksColumn } from "/imports/ui/tasksEditor/TasksColumn";
import { SearchField } from "/imports/ui/util/SearchField";
import { EditTaskDlg } from "./EditTaskDlg";

@Component({
  selector: "tasks-editor",
  standalone: true,
  imports: [CommonModule, SearchField, TasksColumn, TaskBox, EditTaskDlg],
  template: `
    <div class="p-1.5 h-full">
      <div class="flex flex-col gap-1.5 h-full">
        <div
          class="com-patrykmalinowski-avocado-toolbar flex items-center gap-2"
        >
          <div class="w-full max-w-sm flex-none">
            <search-field
              placeholder="Search tasks"
              [value]="searchDraft()"
              (valueChange)="searchDraft.set($event)"
              (search)="searchQuery.set($event)"
              (clear)="clearSearch()"
            ></search-field>
          </div>

          <button type="button" (click)="createTask()">+ New Task</button>
        </div>

        <div class="flex-1 overflow-x-scroll w-full">
          <div class="h-full flex gap-2.5 justify-center min-w-fit">
            <tasks-column
              label="To Do"
              color="var(--pomidor-color-tasks-col-todo)"
            >
              @for (task of tasksTodo(); track task._id) {
                <task-box
                  [task]="task"
                  [editTask]="openEditTask"
                  [deleteTask]="deleteTask"
                ></task-box>
              }
            </tasks-column>

            <tasks-column
              label="In Progress"
              color="var(--pomidor-color-tasks-col-inprogress)"
            >
              @for (task of tasksInProgress(); track task._id) {
                <task-box
                  [task]="task"
                  [editTask]="openEditTask"
                  [deleteTask]="deleteTask"
                ></task-box>
              }
            </tasks-column>

            <tasks-column
              label="Done"
              color="var(--pomidor-color-tasks-col-done)"
            >
              @for (task of tasksDone(); track task._id) {
                <task-box
                  [task]="task"
                  [editTask]="openEditTask"
                  [deleteTask]="deleteTask"
                ></task-box>
              }
            </tasks-column>
          </div>
        </div>
      </div>
    </div>

    <edit-task-dlg #editTaskDlg></edit-task-dlg>
  `,
})
export class TasksEditor implements AfterViewInit, OnDestroy {
  private readonly tasksService = inject(TasksService)!;

  @ViewChild("editTaskDlg")
  private editTaskDlg!: EditTaskDlg;

  readonly shownTasks = signal<Task[]>([
    {
      _id: "task-1",
      createdBy: "user-a",
      assignedTo: "user-b",
      title: "Draft release notes",
      description: "Prepare release highlights for the next sprint demo.",
      status: "todo",
      dateModified: new Date("2026-10-01T09:00:00.000Z"),
    },
    {
      _id: "task-2",
      createdBy: "user-a",
      assignedTo: null,
      title: "Refine onboarding flow",
      description: "Adjust first-run experience copy and remove noisy prompts.",
      status: "inProgress",
      dateModified: new Date("2026-10-03T11:30:00.000Z"),
    },
    {
      _id: "task-3",
      createdBy: "user-c",
      assignedTo: "user-a",
      title: "QA regression run",
      description: "Run smoke suite against latest candidate build.",
      status: "done",
      dateModified: new Date("2026-10-05T16:15:00.000Z"),
    },
  ]);

  readonly searchDraft = signal("");
  readonly searchQuery = signal("");

  readonly filteredTasks = computed(() => {
    const normalizedSearch = this.searchQuery().trim().toLowerCase();
    if (!normalizedSearch) {
      return this.shownTasks();
    }

    return this.shownTasks().filter((task: Task) => {
      return (
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.description.toLowerCase().includes(normalizedSearch)
      );
    });
  });

  readonly tasksTodo = computed(() =>
    this.filteredTasks().filter((task: Task) => task.status === "todo"),
  );
  readonly tasksInProgress = computed(() =>
    this.filteredTasks().filter((task: Task) => task.status === "inProgress"),
  );
  readonly tasksDone = computed(() =>
    this.filteredTasks().filter((task: Task) => task.status === "done"),
  );

  readonly openEditTask = async (task: Task): Promise<void> => {
    await this.tasksService.editDlg.open("edit", task);

    task.dateModified = new Date();
  };

  readonly deleteTask = (task: Task): void => {
    this.shownTasks.update((tasks: Task[]) =>
      tasks.filter((existingTask: Task) => existingTask._id !== task._id),
    );
  };

  clearSearch(): void {
    this.searchDraft.set("");
    this.searchQuery.set("");
  }

  async createTask(): Promise<void> {
    const draftTask: Omit<Task, "_id" | "dateModified"> = {
      createdBy: "user-a",
      assignedTo: null,
      title: "",
      description: "",
      status: "todo",
    };

    await this.tasksService.editDlg.open("new", draftTask as any); //!todo

    this.shownTasks.update((tasks: Task[]) => [
      ...tasks,
      {
        ...draftTask,
        _id: `task-${tasks.length + 1}`,
        dateModified: new Date(),
      },
    ]);
  }

  ngAfterViewInit(): void {
    this.tasksService.registerHost(this.editTaskDlg);
  }

  ngOnDestroy(): void {}
}
