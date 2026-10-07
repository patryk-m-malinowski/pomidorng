import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  type AfterViewInit,
  type OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { CdkConnectedOverlay, CdkOverlayOrigin } from "@angular/cdk/overlay";

@Component({
  selector: "window",
  standalone: true,
  imports: [CommonModule, CdkConnectedOverlay, CdkOverlayOrigin],
  host: {
    class: "block",
  },
  template: `
    <div cdkOverlayOrigin #windowOrigin="cdkOverlayOrigin" class="hidden"></div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="windowOrigin"
      [cdkConnectedOverlayOpen]="isOpen"
      [cdkConnectedOverlayHasBackdrop]="true"
    >
      <div class="com-patrykmalinowski-avocado-window">
        <div
          class="com-patrykmalinowski-avocado-window__blocker fixed inset-0 w-full h-full"
        ></div>
        <div
          #windowRoot
          class="com-patrykmalinowski-avocado-window__window absolute flex flex-col z-1000"
          [ngClass]="className"
          [ngStyle]="{
            left: left + 'px',
            top: top + 'px',
            cursor: resizeCursor,
          }"
          (mousemove)="onMouseMoveDialog($event)"
          (mouseleave)="resizeCursor = 'default'"
          (mousedown)="onResizeMouseDown($event)"
        >
          <div
            class="com-patrykmalinowski-avocado-window__header flex-none"
            [style.cursor]="draggable ? 'move' : 'default'"
            (mousedown)="onMouseDownHeader($event)"
          >
            {{ title }}
          </div>
          <div class="com-patrykmalinowski-avocado-window__content flex-1">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    ".com-patrykmalinowski-avocado-window { position: fixed; inset: 0; z-index: 1000; }",
    ".com-patrykmalinowski-avocado-window__blocker { background: rgba(0, 0, 0, 0.2); }",
    ".com-patrykmalinowski-avocado-window__window { position: absolute; overflow: hidden; }",
    ".com-patrykmalinowski-avocado-window__header { user-select: none; cursor: move; }",
    ".com-patrykmalinowski-avocado-window__content { overflow: auto; }",
  ],
})
export class Window implements AfterViewInit, OnChanges {
  @Input() title = "";
  @Input() className?: string;
  @Input() children?: unknown;
  @Input() initWidth?: string | number = "300px";
  @Input() initHeight?: string | number = "200px";
  @Input() isOpen = false;
  @Input() resizable = false;
  @Input() draggable = true;
  @Input() userCloseable = true;
  @Output() onClose = new EventEmitter<Event | void>();

  @ViewChild("windowRoot")
  set windowRootRef(value: ElementRef<HTMLElement> | undefined) {
    this.windowRoot = value;
    if (value && this.needsCenter) {
      this.center();
      this.needsCenter = false;
    } else if (!value) {
      this.needsCenter = false;
    }
  }

  private windowRoot?: ElementRef<HTMLElement>;

  public left = 0;
  public top = 0;
  public windowWidth: number | null = null;
  public windowHeight: number | null = null;
  public resizeCursor = "default";

  private dragState: DragState | null = null;
  private resizeState: ResizeState | null = null;
  private needsCenter = false;

  private readonly EDGE_SIZE = 8;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (this.isOpen) {
      this.requestCenter();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpen"] && this.isOpen) {
      this.requestCenter();
    }
  }

  @HostListener("document:keydown.escape", ["$event"])
  handleEscape(event: KeyboardEvent): void {
    if (this.isOpen && this.userCloseable) {
      this.close();
      event.preventDefault();
    }
  }

  open(): void {
    this.isOpen = true;
    this.requestCenter();
  }

  close(): void {
    this.isOpen = false;
    this.onClose.emit();
  }

  toCssSize(value: string | number): string {
    return typeof value === "number" ? `${value}px` : value;
  }

  onMouseDownHeader(event: MouseEvent): void {
    if (!this.draggable) {
      return;
    }

    const rect = this.windowElement!.getBoundingClientRect();
    this.dragState = {
      cursor2Window: {
        x: rect.left - event.clientX,
        y: rect.top - event.clientY,
      },
    };

    document.addEventListener("mousemove", this.onDragMove);
    document.addEventListener("mouseup", this.onMouseUpHeader);
  }

  onDragMove = (event: MouseEvent): void => {
    if (!this.dragState) {
      return;
    }

    const leftMax = window.innerWidth - this.windowElement!.offsetWidth;
    const topMax = window.innerHeight - this.windowElement!.offsetHeight;

    let nextLeft = event.clientX + this.dragState.cursor2Window.x;
    let nextTop = event.clientY + this.dragState.cursor2Window.y;

    nextLeft = Math.max(0, Math.min(leftMax, nextLeft));
    nextTop = Math.max(0, Math.min(topMax, nextTop));

    this.left = nextLeft;
    this.top = nextTop;
  };

  onMouseUpHeader = (): void => {
    this.dragState = null;
    document.removeEventListener("mousemove", this.onDragMove);
    document.removeEventListener("mouseup", this.onMouseUpHeader);
  };

  onResizeMove = (event: MouseEvent): void => {
    const state = this.resizeState;
    if (!state || !state.isResizing) {
      return;
    }

    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;

    let newWidth = state.startWidth;
    let newHeight = state.startHeight;
    let newLeft = state.startLeft;
    let newTop = state.startTop;

    if (state.direction.includes("e")) {
      newWidth = state.startWidth + dx;
    }
    if (state.direction.includes("s")) {
      newHeight = state.startHeight + dy;
    }
    if (state.direction.includes("w")) {
      newWidth = state.startWidth - dx;
      newLeft = state.startLeft + dx;
    }
    if (state.direction.includes("n")) {
      newHeight = state.startHeight - dy;
      newTop = state.startTop + dy;
    }

    this.windowWidth = newWidth;
    this.windowHeight = newHeight;
    this.left = newLeft;
    this.top = newTop;
  };

  onResizeMouseUp = (): void => {
    if (!this.resizeState) {
      return;
    }

    this.resizeState.isResizing = false;
    document.removeEventListener("mousemove", this.onResizeMove);
    document.removeEventListener("mouseup", this.onResizeMouseUp);
  };

  onResizeMouseDown(event: MouseEvent): void {
    if (!this.resizable) return;
    const rect = this.windowElement!.getBoundingClientRect();
    const direction = this.getResizeDirection(event, rect);

    if (!direction) {
      return;
    }

    this.resizeState = {
      isResizing: true,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      startLeft: rect.left,
      startTop: rect.top,
    };

    document.addEventListener("mousemove", this.onResizeMove);
    document.addEventListener("mouseup", this.onResizeMouseUp);
  }

  onMouseMoveDialog(event: MouseEvent): void {
    if (!this.resizable) {
      return;
    }

    const within = (value: number, target: number, tolerance: number) =>
      Math.abs(value - target) < tolerance;
    const { top, left, bottom, right } =
      this.windowElement!.getBoundingClientRect();

    let cursor = "";

    if (within(event.clientY, top, this.EDGE_SIZE)) {
      cursor += "n";
    } else if (within(event.clientY, bottom, this.EDGE_SIZE)) {
      cursor += "s";
    }
    if (within(event.clientX, left, this.EDGE_SIZE)) {
      cursor += "w";
    } else if (within(event.clientX, right, this.EDGE_SIZE)) {
      cursor += "e";
    }

    this.resizeCursor = cursor.length ? `${cursor}-resize` : "default";
  }

  private get windowElement(): HTMLElement | null {
    return this.windowRoot?.nativeElement ?? null;
  }

  private requestCenter(): void {
    if (this.windowElement) {
      this.center();
    } else {
      this.needsCenter = true;
    }
  }

  private center(): void {
    const element = this.windowElement;
    const width =
      element?.clientWidth ??
      this.parseSize(this.windowWidth ?? this.initWidth, 300);
    const height =
      element?.clientHeight ??
      this.parseSize(this.windowHeight ?? this.initHeight, 200);
    this.left = (window.innerWidth - width) / 2;
    this.top = (window.innerHeight - height) / 2;
  }

  private parseSize(
    value: string | number | null | undefined,
    fallback: number,
  ): number {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return fallback;
  }

  private getResizeDirection(event: MouseEvent, rect: DOMRect): string | null {
    const { clientX, clientY } = event;
    const onLeft = clientX < rect.left + this.EDGE_SIZE;
    const onRight = clientX > rect.right - this.EDGE_SIZE;
    const onTop = clientY < rect.top + this.EDGE_SIZE;
    const onBottom = clientY > rect.bottom - this.EDGE_SIZE;

    if (onLeft && onTop) return "nw";
    if (onRight && onTop) return "ne";
    if (onLeft && onBottom) return "sw";
    if (onRight && onBottom) return "se";
    if (onLeft) return "w";
    if (onRight) return "e";
    if (onTop) return "n";
    if (onBottom) return "s";

    return null;
  }
}

interface ResizeState {
  isResizing: boolean;
  direction: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
}

interface DragState {
  cursor2Window: {
    x: number;
    y: number;
  };
}

export default Window;
