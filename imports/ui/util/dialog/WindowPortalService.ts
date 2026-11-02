import { CdkPortal } from "@angular/cdk/portal";
import { Injectable, signal } from "@angular/core";

/**
 * Holds the portals of open Window components. App renders them in its window-portal outlet.
 */
@Injectable({ providedIn: "root" })
export class WindowPortalService {
  readonly windows = signal<CdkPortal[]>([]);

  add(portal: CdkPortal): void {
    if (!this.windows().includes(portal)) {
      this.windows.update((list) => [...list, portal]);
    }
  }

  remove(portal: CdkPortal | undefined): void {
    if (portal && this.windows().includes(portal)) {
      this.windows.update((list) => list.filter((p) => p !== portal));
    }
  }
}
