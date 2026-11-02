import {
  AfterContentChecked,
  Component,
  ContentChildren,
  HostBinding,
  Input,
  QueryList,
  signal,
} from "@angular/core";

@Component({
  selector: "stack-page",
  standalone: true,
  template: "<ng-content></ng-content>",
})
export class StackPage {
  @Input() id = "";

  readonly visible = signal(false);

  @HostBinding("style.gridArea") readonly gridArea = "1 / 1";

  @HostBinding("style.opacity")
  get opacity(): string {
    return this.visible() ? "1" : "0";
  }

  @HostBinding("style.pointerEvents")
  get pointerEvents(): string {
    return this.visible() ? "auto" : "none";
  }

  @HostBinding("style.zIndex")
  get zIndex(): string {
    return this.visible() ? "1" : "0";
  }

  @HostBinding("attr.aria-hidden")
  get ariaHidden(): string | null {
    return this.visible() ? null : "true";
  }
}

@Component({
  selector: "stack-layout",
  standalone: true,
  template: `
    <div style="display: grid;">
      <ng-content></ng-content>
    </div>
  `,
})
export class StackLayout implements AfterContentChecked {
  @Input() selection: string | null = null;

  @ContentChildren(StackPage)
  pages!: QueryList<StackPage>;

  ngAfterContentChecked(): void {
    this.pages.forEach((page) => {
      page.visible.set(page.id === this.selection);
    });
  }
}
