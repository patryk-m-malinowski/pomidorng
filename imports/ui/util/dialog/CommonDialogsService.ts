import { Injectable } from "@angular/core";
import { CommonDialogs } from "./CommonDialogs";

@Injectable({ providedIn: "root" })
export default class CommonDialogsService {
  private host: CommonDialogs | null = null;

  registerHost(host: CommonDialogs): void {
    this.host = host;
  }

  unregisterHost(host: CommonDialogs): void {
    if (this.host === host) {
      this.host = null;
    }
  }

  async showConfirmation(title: string, message: string): Promise<boolean> {
    return this.host!.showConfirmation(title, message);
  }

  async showError(title: string, message: string): Promise<void> {
    await this.host!.showError(title, message);
  }

  async showPrompt(
    title: string,
    message: string,
    defaultValue?: string,
  ): Promise<string | null> {
    return this.host!.showPrompt(title, message, defaultValue);
  }

  async showInfo(title: string, message: string): Promise<void> {
    await this.host!.showInfo(title, message);
  }
}
