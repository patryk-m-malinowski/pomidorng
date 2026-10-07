import { Injectable } from "@angular/core";

import type { Task } from "/imports/data/tasks/Task";
import { EditTaskDlg, type EditTaskDlgMode } from "./EditTaskDlg";

@Injectable({ providedIn: "root" })
export default class TasksService {
  public editDlg!: EditTaskDlg;

  registerHost(host: EditTaskDlg): void {
    this.editDlg = host;
  }
}
