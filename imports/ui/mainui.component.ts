import { Component, ViewChild, inject } from "@angular/core";
import { CdkPortal } from "@angular/cdk/portal";
import { HeaderPortalService } from "/imports/ui/header-portal.service";

@Component({
  selector: "main-ui",
  standalone: true,
  imports: [CdkPortal],
  template: `
    <div>Main UI Component ab</div>

    <ng-template cdkPortal #rightPortal="cdkPortal">
      <div>hello</div>
    </ng-template>

    <ng-template cdkPortal #menuPortal="cdkPortal">
      <p>Menu</p>
    </ng-template>
  `,
})
export class MainUI {
  private readonly headerPortalService = inject(HeaderPortalService);

  @ViewChild("rightPortal")
  set rightPortal(portal: CdkPortal | undefined) {
    this.headerPortalService.rightPortal.set(portal ?? null);
  }

  @ViewChild("menuPortal")
  set menuPortal(portal: CdkPortal | undefined) {
    this.headerPortalService.menuPortal.set(portal ?? null);
  }
}
