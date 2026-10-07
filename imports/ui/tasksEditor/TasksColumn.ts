import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "tasks-column",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="com-patrykmalinowski-pomidor-tasks-editor-tasks-column h-full w-75 flex flex-col gap-1 rounded-sm p-2"
      [style.backgroundColor]="color"
    >
      <div>
        <div class="flex justify-between items-center">
          <p
            class="com-patrykmalinowski-pomidor-tasks-editor-tasks-column__label"
          >
            {{ label }}
          </p>
        </div>
      </div>
      <div class="flex flex-col gap-1 overflow-y-auto">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class TasksColumn {
  @Input({ required: true }) label = "";
  @Input() color = "transparent";
}
