import { Component, forwardRef, input, signal } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

/**
 * A labelled checkbox. Works with ngModel / form controls.
 */
@Component({
  selector: "pom-check-box",
  standalone: true,
  template: `
    <label class="flex flex-row gap-1" style="flex-direction: row">
      <input
        type="checkbox"
        [checked]="checked()"
        [disabled]="disabled()"
        (click)="onClick($event)"
        (change)="onInputChange($event)"
        (blur)="onTouched()"
      />
      {{ label() }}
    </label>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckBox),
      multi: true,
    },
  ],
})
export class CheckBox implements ControlValueAccessor {
  readonly label = input("");
  /** When true the value is shown but cannot be changed by the user. */
  readonly readOnly = input(false);

  readonly checked = signal(false);
  readonly disabled = signal(false);

  private onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onClick(event: MouseEvent): void {
    // Checkboxes have no native readonly, so block the toggle
    if (this.readOnly()) {
      event.preventDefault();
    }
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.checked.set(value);
    this.onChange(value);
  }
}
