import {
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatIconModule, MatIcon } from "@angular/material/icon";

@Component({
  selector: "pom-password-editor",
  standalone: true,
  imports: [MatIconModule],
  template: `
    <span class="relative inline-flex w-full items-stretch">
      <input
        [id]="id"
        [name]="name"
        [autocomplete]="autocomplete"
        [required]="required"
        [maxLength]="maxLength"
        [tabindex]="tabIndex ?? 0"
        [type]="isVisible() ? 'text' : 'password'"
        [value]="currentValue()"
        (input)="handleInput($event)"
        (blur)="onTouched()"
        class="m-0 h-7 w-full flex-1 px-2 pr-10 text-(--avocado-color-text)"
      />
      <span class="absolute right-0 top-1/2 -translate-y-1/2">
        <div
          type="button"
          [attr.aria-label]="isVisible() ? 'Hide password' : 'Show password'"
          [attr.aria-pressed]="isVisible()"
          class="p-0 m-1 text-(--avocado-color-text) bg-transparent flex items-center cursor-pointer"
          tabindex="-1"
          (mousedown)="$event.preventDefault()"
          (click)="toggleVisibility()"
        >
          @if (isVisible()) {
            <mat-icon>visibility_off</mat-icon>
          } @else {
            <mat-icon>visibility</mat-icon>
          }
        </div>
      </span>
    </span>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordEditor),
      multi: true,
    },
  ],
})
export class PasswordEditor implements ControlValueAccessor {
  @Input() id = "";
  @Input() name = "";
  @Input() autocomplete = "";
  @Input() required = false;
  @Input() maxLength?: number = 32;
  @Input() tabIndex: number | null = 0;
  @Input() set value(v: string) {
    this.currentValue.set(v ?? "");
  }
  get value(): string {
    return this.currentValue();
  }
  @Input() placeholder = "";

  @Output() valueChange = new EventEmitter<string>();

  readonly isVisible = signal(false);
  readonly currentValue = signal("");

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.currentValue.set(value ?? "");
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(): void {
    // Intentionally left blank; this editor is not used in a disabled state.
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.currentValue.set(target.value);
    this.onChange(target.value);
    this.valueChange.emit(target.value);
  }

  toggleVisibility(): void {
    this.isVisible.update((v) => !v);
  }
}
