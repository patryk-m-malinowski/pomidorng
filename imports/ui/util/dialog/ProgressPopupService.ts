import { Injectable, inject } from "@angular/core";
import { ProgressPopupDlg } from "./ProgressPopupDlg";

export interface ProgressTask {
  finish(): void;
}

@Injectable({ providedIn: "root" })
export default class ProgressPopupService {
  private host: ProgressPopupDlg | null = null;
  private taskCount = 0;
  private messageMap = new Map<number, string>();
  private nextTaskId = 0;

  registerHost(host: ProgressPopupDlg): void {
    this.host = host;
  }

  unregisterHost(host: ProgressPopupDlg): void {
    if (this.host === host) {
      this.host = null;
    }
  }

  addTask(message: string): ProgressTask {
    const taskId = this.nextTaskId++;
    this.messageMap.set(taskId, message);
    this.taskCount++;

    if (!this.host) {
      console.error(
        "ProgressPopupService: No host registered to display progress messages.",
      );
    } else {
      this.host.addMessage(taskId, message);
      if (!this.host.isOpen()) {
        this.host.open();
      }
    }

    return {
      finish: () => this.finishTask(taskId),
    };
  }

  private finishTask(taskId: number): void {
    this.messageMap.delete(taskId);
    this.taskCount--;

    if (this.host) {
      this.host.removeMessage(taskId);
      if (this.taskCount === 0) {
        this.host.close();
      }
    }
  }
}
