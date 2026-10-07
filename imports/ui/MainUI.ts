import { CdkPortal } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { Component, OnDestroy, ViewChild, inject, model } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs/operators";
import { HeaderPortalService } from "/imports/ui/HeaderPortalService";
import { HeaderMenu } from "/imports/ui/header/HeaderMenu";
import { HeaderTabs } from "/imports/ui/header/HeaderTabs";
import type { Page } from "/imports/ui/header/Page";
import { TasksEditor } from "/imports/ui/tasksEditor/TasksEditor";

@Component({
  selector: "main-ui",
  standalone: true,
  imports: [CommonModule, CdkPortal, HeaderTabs, HeaderMenu, MatIcon],
  host: {
    class: "h-full",
  },
  template: `
    @for (pageEntry of pageEntries; track pageEntry[0]) {
      <div
        [hidden]="pageEntry[0] !== selectedPage()"
        class="com-patrykmalinowski-pomidor-page h-full"
      >
        <ng-container
          *ngComponentOutlet="pageEntry[1].component"
        ></ng-container>
      </div>
    }

    <ng-template cdkPortal #rightPortal="cdkPortal">
      <div class="hidden lg:block h-full">
        <header-tabs
          [pages]="pages"
          [(selectedPage)]="selectedPage"
        ></header-tabs>
      </div>

      <div class="flex lg:hidden items-center justify-center h-full">
        <header-menu [(open)]="isMenuOpen"></header-menu>
      </div>
    </ng-template>

    <ng-template cdkPortal #menuPortal="cdkPortal">
      @if (isMenuOpen()) {
        <div
          style="position: absolute; z-index: 1000"
          (click)="isMenuOpen.set(false)"
        >
          <div class="com-patrykmalinowski-pomidor-popup">
            <div class="com-patrykmalinowski-pomidor-headermenu w-screen">
              @for (pageEntry of pageEntries; track pageEntry[0]) {
                <div
                  class="com-patrykmalinowski-pomidor-headermenu__tab-button flex w-full items-center justify-center gap-1 p-1"
                  [class.com-patrykmalinowski-pomidor-headermenu__tab-button--selected]="
                    pageEntry[0] === selectedPage()
                  "
                  (click)="onSelectPageFromMenu(pageEntry[0])"
                >
                  <mat-icon>{{ pageEntry[1].icon }}</mat-icon>
                  <p>{{ pageEntry[1].title }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </ng-template>
  `,
})
export class MainUI implements OnDestroy {
  private readonly headerPortalService = inject(HeaderPortalService);
  private readonly router = inject(Router);

  readonly selectedPage = model<string>("tasks");
  readonly isMenuOpen = model<boolean>(false);
  readonly pages: Record<string, Page> = {
    tasks: {
      title: "Tasks",
      icon: "list",
      component: TasksEditor,
    },
    users: {
      title: "Users",
      icon: "shield",
      component: UsersPage,
    },
    me: {
      title: "Me",
      icon: "account_circle",
      component: MePage,
    },
  };

  get pageEntries(): [string, Page][] {
    return Object.entries(this.pages) as [string, Page][];
  }

  constructor() {
    this.selectedPage.subscribe((pageId) => {
      const currentPath = this.router.url.split("?")[0];
      const expectedPath = `/pomidorapp/${pageId}`;

      if (!this.pages[pageId]) {
        return;
      }

      window.localStorage.setItem("pomidor.selectedPage", pageId);

      if (currentPath !== expectedPath) {
        void this.router.navigateByUrl(expectedPath);
      }
    });

    this.syncSelectedPage();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.syncSelectedPage());
  }
  /**
   * @implements OnDestroy
   */
  ngOnDestroy(): void {
    this.headerPortalService.rightPortal.set(null);
    this.headerPortalService.menuPortal.set(null);
  }

  @ViewChild("rightPortal")
  set rightPortal(portal: CdkPortal | undefined) {
    this.headerPortalService.rightPortal.set(portal ?? null);
  }

  @ViewChild("menuPortal")
  set menuPortal(portal: CdkPortal | undefined) {
    this.headerPortalService.menuPortal.set(portal ?? null);
  }

  onSelectPageFromMenu(pageId: string): void {
    this.isMenuOpen.set(false);
    this.selectedPage.set(pageId);
  }

  /**
   * Copies the value from the URL into this component's selectedPage signal.
   * @returns void
   */
  private syncSelectedPage(): void {
    const nextPage = this.getPageFromPathname(this.router.url);

    if (!nextPage) {
      const fallbackPage =
        window.localStorage.getItem("pomidor.selectedPage") ?? "tasks";
      this.selectedPage.set(fallbackPage);
      return;
    }

    this.selectedPage.set(nextPage);
  }

  private getPageFromPathname(pathname: string): string | null {
    const match = pathname.match(/^\/pomidorapp\/([^/]+)/);
    const page = match?.[1] ?? "";

    if (!Object.keys(this.pages).includes(page)) {
      return null;
    }

    return page;
  }
}

@Component({
  selector: "users-page",
  standalone: true,
  template: `
    <div class="flex h-full items-center justify-center p-4">
      <h2 class="text-xl font-bold">Users</h2>
    </div>
  `,
})
class UsersPage {}

@Component({
  selector: "me-page",
  standalone: true,
  template: `
    <div class="flex h-full items-center justify-center p-4">
      <h2 class="text-xl font-bold">Me</h2>
    </div>
  `,
})
class MePage {}
