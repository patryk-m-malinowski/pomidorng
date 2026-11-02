import {
  AfterViewInit,
  Component,
  OnDestroy,
  ViewChild,
  inject,
} from "@angular/core";
import { CommonDlg } from "./CommonDlg";
import { PromptDlg } from "./PromptDlg";
import CommonDialogsService from "./CommonDialogsService";

@Component({
  selector: "pom-common-dialogs",
  standalone: true,
  imports: [CommonDlg, PromptDlg],
  template: `
    <pom-common-dlg #confirmDlg buttons="yes,no" icon="help"></pom-common-dlg>
    <pom-common-dlg #errorDlg buttons="ok" icon="error"></pom-common-dlg>
    <pom-prompt-dlg #promptDlg></pom-prompt-dlg>
    <pom-common-dlg #infoDlg buttons="ok" icon="info"></pom-common-dlg>
  `,
})
export class CommonDialogs implements AfterViewInit, OnDestroy {
  private readonly dialogsService = inject(CommonDialogsService);

  @ViewChild("confirmDlg")
  private confirmDlg?: CommonDlg;

  @ViewChild("errorDlg")
  private errorDlg?: CommonDlg;

  @ViewChild("promptDlg")
  private promptDlg?: PromptDlg;

  @ViewChild("infoDlg")
  private infoDlg?: CommonDlg;

  ngAfterViewInit(): void {
    this.dialogsService.registerHost(this);
  }

  ngOnDestroy(): void {
    this.dialogsService.unregisterHost(this);
  }

  async showConfirmation(title: string, message: string): Promise<boolean> {
    const button = await this.confirmDlg!.open(title, message);
    return button === "yes";
  }

  async showError(title: string, message: string): Promise<void> {
    await this.errorDlg!.open(title, message);
  }

  async showPrompt(
    title: string,
    message: string,
    defaultValue?: string,
  ): Promise<string | null> {
    return this.promptDlg!.open(title, message, defaultValue) ?? null;
  }

  async showInfo(title: string, message: string): Promise<void> {
    await this.infoDlg!.open(title, message);
  }
}
