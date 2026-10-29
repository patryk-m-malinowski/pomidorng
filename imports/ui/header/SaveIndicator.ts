import { Component, inject } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import PendingRequestsService from "/imports/client/PendingRequestsService";

@Component({
  selector: "save-indicator",
  standalone: true,
  imports: [MatIcon],
  template: `
    <div class="flex gap-1 items-center text-sm">
      <div class="inline-flex relative w-8">
        <mat-icon>save</mat-icon>
        <mat-icon
          class="absolute left-2.5 top-0.75"
          style="filter: drop-shadow(0 0 2px rgba(0, 0, 0, 1))"
          >{{
            methodCallState.pendingRequests() > 0 ? "hourglass_top" : "check"
          }}</mat-icon
        >
      </div>
      <p>{{ methodCallState.pendingRequests() > 0 ? "Saving..." : "Saved" }}</p>
    </div>
  `,
})
export class SaveIndicator {
  readonly methodCallState = inject(PendingRequestsService);
}
