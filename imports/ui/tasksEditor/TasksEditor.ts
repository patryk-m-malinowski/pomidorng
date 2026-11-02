import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from "@angular/core";
import { TaskCollection } from "#pomidor/db/tasks/TaskCollection";
import { Tracker } from "meteor/tracker";

import { Task } from "#pomidor/data/tasks/Task";
import TasksService from "./TasksService";
import { TaskBox } from "#pomidor/ui/tasksEditor/TaskBox";
import { TasksColumn } from "#pomidor/ui/tasksEditor/TasksColumn";
import { SearchField } from "#pomidor/ui/util/SearchField";
import { EditTaskDlg } from "./EditTaskDlg";
import { ServerPojo } from "#pomidor/common/mso/ObjectsPool";
import { PoolFactory } from "#pomidor/common/mso/PoolFactory";
import CommonDialogsService from "../util/dialog/CommonDialogsService";
import UserService from "../UserService";

@Component({
  selector: "pom-tasks-editor",
  standalone: true,
  imports: [CommonModule, SearchField, TasksColumn, TaskBox, EditTaskDlg],
  template: `
    <div class="p-1.5 h-full">
      <div class="flex flex-col gap-1.5 h-full">
        <div
          class="com-patrykmalinowski-avocado-toolbar flex items-center gap-2"
        >
          <div class="w-full max-w-sm flex-none">
            <pom-search-field
              placeholder="Search tasks"
              [value]="searchDraft()"
              (valueChange)="searchDraft.set($event)"
              (search)="searchQuery.set($event)"
              (clear)="clearSearch()"
            ></pom-search-field>
          </div>

          <button
            type="button"
            (click)="createTask()"
            [disabled]="!userService.user()"
          >
            + New Task
          </button>
        </div>

        <div class="flex-1 overflow-x-scroll w-full">
          <div class="h-full flex gap-2.5 justify-center min-w-fit">
            <pom-tasks-column
              label="To Do"
              color="var(--pomidor-color-tasks-col-todo)"
            >
              @for (task of tasksTodo(); track task._id) {
                <pom-task-box
                  [task]="task"
                  [editTask]="openEditTask"
                  [deleteTask]="deleteTask"
                ></pom-task-box>
              }
            </pom-tasks-column>

            <pom-tasks-column
              label="In Progress"
              color="var(--pomidor-color-tasks-col-inprogress)"
            >
              @for (task of tasksInProgress(); track task._id) {
                <pom-task-box
                  [task]="task"
                  [editTask]="openEditTask"
                  [deleteTask]="deleteTask"
                ></pom-task-box>
              }
            </pom-tasks-column>

            <pom-tasks-column
              label="Done"
              color="var(--pomidor-color-tasks-col-done)"
            >
              @for (task of tasksDone(); track task._id) {
                <pom-task-box
                  [task]="task"
                  [editTask]="openEditTask"
                  [deleteTask]="deleteTask"
                ></pom-task-box>
              }
            </pom-tasks-column>
          </div>
        </div>
      </div>
    </div>

    <pom-edit-task-dlg #editTaskDlg></pom-edit-task-dlg>
  `,
})
export class TasksEditor implements AfterViewInit, OnInit, OnDestroy {
  private tasksSub: Meteor.SubscriptionHandle | null = null;
  private tracker: Tracker.Computation | null = null;
  private loading = signal(true);

  readonly tasksService = inject(TasksService)!;
  readonly dialogs = inject(CommonDialogsService)!;
  readonly userService = inject(UserService)!;

  @ViewChild("editTaskDlg")
  private editTaskDlg!: EditTaskDlg;

  readonly searchDraft = signal("");
  readonly searchQuery = signal("");
  readonly tasks = signal<Task[]>([]);

  readonly filteredTasks = computed(() => {
    const normalizedSearch = this.searchQuery().trim().toLowerCase();
    if (!normalizedSearch) {
      return this.tasks();
    }

    return this.tasks().filter((task: Task) => {
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

  readonly deleteTask = async (task: Task): Promise<void> => {
    let confirm = await this.dialogs.showConfirmation(
      "Delete Task",
      "Are you sure you want to delete this task?",
    );
    if (!confirm) {
      return;
    }
    this.tasks.update((tasks: Task[]) =>
      tasks.filter((existingTask: Task) => existingTask._id !== task._id),
    );
    task.delete();
  };

  clearSearch(): void {
    this.searchDraft.set("");
    this.searchQuery.set("");
  }

  async createTask(): Promise<void> {
    let task = new Task();
    let okPressed = await this.tasksService.editDlg.open("new", task);
    if (okPressed) {
      await task.register();
    }
  }

  ngAfterViewInit(): void {
    this.tasksService.registerHost(this.editTaskDlg);
  }
  ngOnInit(): void {
    this.tasksSub = Meteor.subscribe("tasks.Task", {
      onReady: () => {
        this.loading.set(false);
      },
      onStop: (err?: Error) => {
        this.loading.set(false);
      },
    });

    // Reactively fetch data from the collection
    this.tracker = Tracker.autorun(() => {
      const pojos = TaskCollection.find({}).fetch() as ServerPojo[];
      let tasks = pojos.map((pojo) =>
        PoolFactory.instance.getPool(Task).get(pojo),
      );
      this.tasks.set(tasks);
    });
  }
  ngOnDestroy(): void {
    if (this.tasksSub) {
      this.tasksSub.stop();
    }
    if (this.tracker) {
      this.tracker.stop();
    }
  }
}
