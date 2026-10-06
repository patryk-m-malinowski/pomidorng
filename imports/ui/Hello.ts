import { Component } from "@angular/core";

@Component({
  selector: "hello",
  standalone: true,
  template: `
    <div>
      <button (click)="increment()">Click Me</button>
      <p>You've pressed the button {{ counter }} times.</p>
    </div>
  `,
})
export class Hello {
  counter = 0;

  increment() {
    this.counter += 1;
  }
}
