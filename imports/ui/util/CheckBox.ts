import { Component, forwardRef, input, signal } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";

/**
 * A labelled checkbox. Works with ngModel / form controls.
 */
@Component({
  selector: "pom-check-box",
  standalone: true,
  imports: [MatIcon],
  template: `
    <label
      class="pom-checkbox-label flex flex-row items-center gap-1"
      [class.checked]="checked()"
      [class.disabled]="disabled()"
      (click)="onLabelClick($event)"
    >
      <div
        class="pom-checkbox"
        [class.checked]="checked()"
        [attr.aria-checked]="checked()"
        role="checkbox"
        [attr.tabindex]="disabled() ? -1 : 0"
        (click)="onCheckboxClick($event)"
        (keydown.space)="onKeydown($event)"
        (blur)="onTouched()"
      >
        @if (checked()) {
          <mat-icon class="pom-checkbox-icon">check</mat-icon>
        }
      </div>
      {{ label() }}
    </label>
  `,
  styles: [
    `
      .pom-checkbox-label {
        cursor: pointer;
        user-select: none;
        outline: none;

        &.disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      }

      .pom-checkbox {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        min-width: 20px;
        min-height: 20px;
        background-color: white;
        border: 2px solid #ccc;
        border-radius: 3px;
        cursor: pointer;
        flex-shrink: 0;
        outline: none;

        &:hover:not(.disabled) {
          border-color: #999;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
        }

        &:focus-visible {
          outline: 2px solid var(--avocado-color-focus);
          outline-offset: 2px;
        }

        &.checked {
          background-color: var(--avocado-color-button);
          border-color: var(--avocado-color-button);

          &:hover:not(.disabled) {
            background-color: var(--avocado-color-button-background-hover);
            border-color: var(--avocado-color-button-background-hover);
          }
        }
      }

      .pom-checkbox-icon {
        color: white;
        font-size: 16px;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
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

  onCheckboxClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled() || this.readOnly()) {
      return;
    }
    this.toggle();
  }

  onLabelClick(event: MouseEvent): void {
    // Only toggle if click target is the label text, not the checkbox
    // The checkbox click handler stops propagation, so this only fires for label text
    if (this.disabled() || this.readOnly()) {
      event.preventDefault();
      return;
    }
    this.toggle();
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.readOnly()) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    this.toggle();
  }

  private toggle(): void {
    const newValue = !this.checked();
    this.checked.set(newValue);
    this.onChange(newValue);
  }
}
