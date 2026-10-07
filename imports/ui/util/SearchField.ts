import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "search-field",
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon],
  template: `
    <span
      class="com-patrykmalinowski-avocado-searchfield relative inline-flex w-full items-stretch"
    >
      <input
        type="text"
        [placeholder]="placeholder"
        [ngModel]="value"
        (ngModelChange)="onValueChanged($event)"
        (keydown.enter)="onEnter($event)"
        class="com-patrykmalinowski-avocado-searchfield__field w-full flex-1"
      />

      <span
        class="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 pr-1"
      >
        <button
          type="button"
          aria-label="Search"
          class="com-patrykmalinowski-avocado-searchfield__btn-search"
          (click)="emitSearch()"
        >
          <mat-icon>search</mat-icon>
        </button>
        <button
          type="button"
          aria-label="Clear search"
          class="com-patrykmalinowski-avocado-searchfield__btn-clear"
          (click)="emitClear()"
        >
          <mat-icon>close</mat-icon>
        </button>
      </span>
    </span>
  `,
})
export class SearchField {
  @Input() value = "";
  @Input() placeholder = "";

  @Output() valueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  onValueChanged(nextValue: string): void {
    this.value = nextValue;
    this.valueChange.emit(nextValue);
  }

  onEnter(event: Event): void {
    event.preventDefault();
    this.emitSearch();
  }

  emitSearch(): void {
    this.search.emit(this.value);
  }

  emitClear(): void {
    this.value = "";
    this.valueChange.emit("");
    this.clear.emit();
    this.search.emit("");
  }
}
