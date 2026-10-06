import { Component } from "@angular/core";

@Component({
  selector: "app-central-box",
  standalone: true,
  template: `
    <div
      class="com-patrykmalinowski-pomidor-central-box min-h-0 w-full h-full flex flex-col justify-center items-center"
    >
      <div
        class="com-patrykmalinowski-pomidor-central-box__box-container w-full max-w-xl max-h-full overflow-y-auto"
      >
        <div class="com-patrykmalinowski-pomidor-central-box__box w-full">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class CentralBox {}
