/**
 * A table component. Supports scrolling, selection, resizeable columns and sorting.
 * Selection mode is currently single, but may be extended to multiple selection.
 *
 * Usage:
 * <pom-pomidor-table [selection]="ids" (selectionChange)="...">
 *   <pom-pomidor-columns>
 *     <pom-pomidor-column id="name" title="Name" [width]="180" />
 *   </pom-pomidor-columns>
 *   <pom-pomidor-row id="1"><td>...</td></pom-pomidor-row>
 * </pom-pomidor-table>
 */
import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  ElementRef,
  TemplateRef,
  ViewChild,
  computed,
  contentChildren,
  inject,
  input,
  output,
  signal,
} from "@angular/core";

/**
 * Specification of a column of the table. Must be a child of <pom-pomidor-columns>.
 */
@Component({
  selector: "pom-pomidor-column",
  standalone: true,
  template: "",
})
export class Column {
  /** A unique ID for this column. */
  readonly id = input.required<string>();
  /** Title of the column displayed in the header. */
  readonly title = input.required<string>();
  /** Whether this column is sortable. */
  readonly sortable = input(false);
  /**
   * Only relevant when sortable is true.
   * Returns a number indicating the order of the two rows.
   * If omitted, the text of the cells is compared.
   * Arguments are the IDs of the rows to compare.
   */
  readonly comparator = input<((a: string, b: string) => number) | undefined>();
  /** Initial column width. */
  readonly width = input<number | string | undefined>();
  /** Minimum width in pixels respected by resize. */
  readonly minWidth = input<number | undefined>();
  /** Maximum width in pixels respected by resize. */
  readonly maxWidth = input<number | undefined>();
}

/**
 * Groups the <pom-pomidor-column> children.
 */
@Component({
  selector: "pom-pomidor-columns",
  standalone: true,
  template: "",
})
export class Columns {
  readonly columns = contentChildren(Column);
}

/**
 * A row of the table. Its children must be <td> elements, one per column.
 */
@Component({
  selector: "pom-pomidor-row",
  standalone: true,
  template: `<ng-template #content><ng-content /></ng-template>`,
})
export class Row {
  /** A unique ID for this row. Used to identify the row when it is selected. */
  readonly id = input.required<string>();

  @ViewChild("content", { static: true })
  readonly content!: TemplateRef<unknown>;
}

interface SortState {
  columnId: string;
  direction: "asc" | "desc";
}

@Component({
  selector: "pom-pomidor-table",
  standalone: true,
  imports: [NgTemplateOutlet],
  host: {
    class:
      "com-patrykmalinowski-pomidor-table block overflow-auto max-h-full max-w-fit",
  },
  template: `
    <table class="border-collapse table-fixed">
      <colgroup>
        @for (column of columns(); track column.id()) {
          <col [style.width]="widthOf(column)" />
        }
      </colgroup>
      <thead class="w-full sticky top-0 z-10">
        <tr>
          @for (column of columns(); track column.id()) {
            <th class="text-left relative select-none">
              <div
                [class]="column.sortable() ? 'cursor-pointer pr-2' : 'pr-2'"
                (click)="onHeaderClick(column)"
              >
                {{ column.title() }}{{ sortMarker(column) }}
              </div>
              <div
                class="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                (mousedown)="startResize(column, $event)"
              ></div>
            </th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of visibleRows(); track row.id()) {
          <tr
            class="com-patrykmalinowski-pomidor-table__row"
            [class.com-patrykmalinowski-pomidor-table__row--selected]="
              isSelected(row)
            "
            [attr.data-row-id]="row.id()"
            (click)="onRowClick(row)"
          >
            <ng-container *ngTemplateOutlet="row.content" />
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class PomidorTable {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The IDs of the rows that are currently selected. */
  readonly selection = input<string[]>([]);
  readonly selectionMode = input<"none" | "single" | "multiple">("single");
  /** Emitted when the selection is changed by the user. */
  readonly selectionChange = output<string[]>();

  private readonly columnsGroup = contentChildren(Columns);
  private readonly rows = contentChildren(Row, { descendants: true });

  private readonly sortState = signal<SortState | null>(null);
  private readonly columnWidths = signal<Record<string, number>>({});

  readonly columns = computed(() =>
    this.columnsGroup().flatMap((group) => group.columns()),
  );

  readonly visibleRows = computed(() => {
    const rows = this.rows();
    const sort = this.sortState();
    const column = sort && this.columns().find((c) => c.id() === sort.columnId);
    if (!sort || !column || !column.sortable()) return rows;

    const index = this.columns().indexOf(column);
    const comparator = column.comparator();
    const sorted = [...rows].sort((a, b) =>
      comparator
        ? comparator(a.id(), b.id())
        : this.cellText(a.id(), index).localeCompare(
            this.cellText(b.id(), index),
            undefined,
            { numeric: true, sensitivity: "base" },
          ),
    );
    if (sort.direction === "desc") sorted.reverse();
    return sorted;
  });

  /**
   * Text of a rendered cell, used as the default sort key.
   */
  private cellText(rowId: string, columnIndex: number): string {
    const tr = this.el.nativeElement.querySelector(
      `tr[data-row-id="${CSS.escape(rowId)}"]`,
    );
    return tr?.children[columnIndex]?.textContent?.trim() ?? "";
  }

  isSelected(row: Row): boolean {
    return this.selection().includes(row.id());
  }

  widthOf(column: Column): number | string | undefined {
    return this.columnWidths()[column.id()] ?? column.width();
  }

  sortMarker(column: Column): string {
    const sort = this.sortState();
    if (sort?.columnId !== column.id()) return "";
    return sort.direction === "asc" ? " ▲" : " ▼";
  }

  onHeaderClick(column: Column): void {
    if (!column.sortable()) return;
    this.sortState.update((prev) => {
      if (!prev || prev.columnId !== column.id()) {
        return { columnId: column.id(), direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { columnId: column.id(), direction: "desc" };
      }
      return null;
    });
  }

  onRowClick(row: Row): void {
    const mode = this.selectionMode();
    if (mode === "none") return;

    const id = row.id();
    let next: string[];
    if (mode === "single") {
      next = [id];
    } else {
      const current = this.selection();
      next = current.includes(id)
        ? current.filter((it) => it !== id)
        : [...current, id];
    }
    this.selectionChange.emit(next);
  }

  startResize(column: Column, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const width = this.widthOf(column);
    const startWidth = typeof width === "number" ? width : 160;
    const min = column.minWidth() ?? 60;
    const max = column.maxWidth() ?? 1200;

    const onMove = (moveEvent: MouseEvent) => {
      const next = Math.max(
        min,
        Math.min(max, startWidth + moveEvent.clientX - startX),
      );
      this.columnWidths.update((prev) => ({ ...prev, [column.id()]: next }));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
}
