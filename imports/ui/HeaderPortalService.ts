import { Injectable, signal } from "@angular/core";
import { CdkPortal } from "@angular/cdk/portal";

@Injectable({ providedIn: "root" })
export class HeaderPortalService {
  readonly rightPortal = signal<CdkPortal | null>(null);
  readonly menuPortal = signal<CdkPortal | null>(null);
}
