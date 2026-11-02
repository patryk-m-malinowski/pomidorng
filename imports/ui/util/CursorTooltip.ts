import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import {
  Component,
  Directive,
  HostListener,
  OnDestroy,
  inject,
  input,
  signal,
} from "@angular/core";

@Component({
  selector: "pom-cursor-tooltip-surface",
  standalone: true,
  template: `<div class="com-patrykmalinowski-avocado-tooltip">
    <div
      class="com-patrykmalinowski-avocado-tooltip__surface px-2 py-1 text-sm"
      role="tooltip"
    >
      {{ text() }}
    </div>
  </div>`,
})
export class CursorTooltipSurface {
  readonly text = signal("");
}

/**
 * A tooltip which appears next to the mouse cursor (Angular Material's
 * tooltip always centers itself on the host element).
 * Usage: <button cursorTooltip="Text">
 */
@Directive({ selector: "[cursorTooltip]", standalone: true })
export class CursorTooltip implements OnDestroy {
  readonly text = input.required<string>({ alias: "cursorTooltip" });

  private readonly overlay = inject(Overlay);
  private overlayRef: OverlayRef | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;

  @HostListener("mouseenter", ["$event"])
  onEnter(event: MouseEvent): void {
    this.clearTimer();
    this.showTimer = setTimeout(() => this.show(event), 300);
    this.lastEvent = event;
  }

  private lastEvent: MouseEvent | null = null;

  @HostListener("mousemove", ["$event"])
  onMove(event: MouseEvent): void {
    this.lastEvent = event;
  }

  @HostListener("mouseleave")
  @HostListener("mousedown")
  @HostListener("blur")
  hide(): void {
    this.clearTimer();
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnDestroy(): void {
    this.hide();
  }

  private show(initial: MouseEvent): void {
    const { clientX: x, clientY: y } = this.lastEvent ?? initial;
    this.overlayRef?.dispose();
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo({ x, y })
        .withPositions([
          // Below and to the right of the cursor, flipping when out of space
          {
            originX: "start",
            originY: "bottom",
            overlayX: "start",
            overlayY: "top",
            offsetX: 8,
            offsetY: 12,
          },
          {
            originX: "start",
            originY: "top",
            overlayX: "start",
            overlayY: "bottom",
            offsetX: 8,
            offsetY: -8,
          },
          {
            originX: "end",
            originY: "bottom",
            overlayX: "end",
            overlayY: "top",
            offsetX: -8,
            offsetY: 12,
          },
          {
            originX: "end",
            originY: "top",
            overlayX: "end",
            overlayY: "bottom",
            offsetX: -8,
            offsetY: -8,
          },
        ])
        .withPush(true),
      scrollStrategy: this.overlay.scrollStrategies.close(),
      panelClass: "pointer-events-none",
    });
    const ref = this.overlayRef.attach(
      new ComponentPortal(CursorTooltipSurface),
    );
    ref.instance.text.set(this.text());
    ref.changeDetectorRef.detectChanges();
  }

  private clearTimer(): void {
    if (this.showTimer) clearTimeout(this.showTimer);
    this.showTimer = null;
  }
}
