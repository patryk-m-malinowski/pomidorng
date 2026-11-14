import { CdkPortal } from "@angular/cdk/portal";
import { Injectable, signal } from "@angular/core";

/**
 * Holds the portals of open Window components. App renders them in its window-portal outlet.
 */
@Injectable({ providedIn: "root" })
export class WindowPortalService {
  private nextId = 1;
  readonly windowToId = new Map<CdkPortal, number>();
  readonly windows = signal<{ portal: CdkPortal; id: number }[]>([]);

  private updateOutput(): void {
    const entries = Array.from(this.windowToId.entries());
    const out = entries.map(([portal, id]) => ({ portal, id }));
    this.windows.set(out);
  }

  add(portal: CdkPortal): void {
    if (!this.windowToId.has(portal)) {
      const id = this.nextId++;
      this.windowToId.set(portal, id);
      this.updateOutput();
    }
  }

  remove(portal: CdkPortal | undefined): void {
    if (portal && this.windowToId.has(portal)) {
      this.windowToId.delete(portal);
      this.updateOutput();
    }
  }
}
