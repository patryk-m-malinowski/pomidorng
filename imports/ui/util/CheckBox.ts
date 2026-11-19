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
  host: {
    class: "pom-checkbox",
  },
  template: `
    <label
      class="pom-checkbox__label flex flex-row items-center gap-1"
      [class.pom-checkbox__label--checked]="checked()"
      [class.pom-checkbox__label--disabled]="disabled()"
      (click)="onLabelClick($event)"
    >
      <div
        class="pom-checkbox__toggle"
        [class.pom-checkbox__toggle--checked]="checked()"
        [class.pom-checkbox__toggle--disabled]="disabled()"
        [attr.aria-checked]="checked()"
        role="checkbox"
        [attr.tabindex]="disabled() ? -1 : 0"
        (click)="onCheckboxClick($event)"
        (keydown.space)="onKeydown($event)"
        (blur)="onTouched()"
      >
        @if (checked()) {
          <mat-icon class="pom-checkbox__icon">check</mat-icon>
        }
      </div>
      {{ label() }}
    </label>
  `,
  styles: [
    `
      .pom-checkbox__label {
        cursor: pointer;
        user-select: none;
        outline: none;
      }
      .pom-checkbox__label--disabled {
        cursor: not-allowed !important;
        opacity: 0.5;
      }

      .pom-checkbox__toggle {
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

        &:hover:not(.pom-checkbox__toggle--disabled) {
          border-color: #999;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
        }

        &:hover.pom-checkbox__toggle--disabled {
          cursor: not-allowed;
        }

        &:focus-visible {
          outline: 2px solid var(--avocado-color-focus);
          outline-offset: 2px;
        }
      }
      .pom-checkbox__toggle--checked {
        background-color: var(--avocado-color-button);
        border-color: var(--avocado-color-button);

        &:hover:not(.pom-checkbox__toggle--disabled) {
          background-color: var(--avocado-color-button-background-hover);
          border-color: var(--avocado-color-button-background-hover);
        }
      }

      .pom-checkbox__icon {
        color: white;
        font-size: 16px;
        width: 20px;
        height: 20px;
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
