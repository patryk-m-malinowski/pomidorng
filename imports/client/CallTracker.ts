import { signal } from "@angular/core";

/**
 * This class monitors for when the connection with the Meteor server is lost.
 * It gets told when requests start and finish, and if it detects that no requests have finished after a certain timeout, it considers the connection lost.
 */
export class CallTracker {
  /**
   * Timeout to show the popup after we lose connection
   */
  private timeout: number;
  /**
   * ID of the timer used to measure the timeout
   */
  private timerId?: any;
  /**
   * Number of pending requests
   */
  public nRequests = signal<number>(0);
  /**
   * Whether we are offline i.e. we need to show the popup or not
   */
  public offline = signal<boolean>(false);

  constructor(timeout: number) {
    this.timeout = timeout;
  }

  /**
   * Called by Meteor.callAsync
   */
  public beginRequest() {
    if (!this.timerId) {
      this.startTimer();
    }
    this.nRequests.update((x) => x + 1);
  }

  /**
   * Called by Meteor.callAsync
   */
  public endRequest() {
    this.stopTimer();
    if (this.offline()) {
      this.makeOnline();
    }
    this.nRequests.update((x) => x - 1);
    if (this.nRequests() > 0) {
      this.startTimer();
    }
  }

  private startTimer() {
    if (process.env.NODE_ENV === "development") {
      if (this.timerId) {
        throw new Error(
          "Timer started while it it set. You need to cancel the timer first.",
        );
      }
    }
    this.timerId = setTimeout(() => this.makeOffline(), this.timeout);
  }

  private stopTimer() {
    this.timerId && clearTimeout(this.timerId);
    this.timerId = null;
  }

  private makeOffline() {
    if (process.env.NODE_ENV === "development") {
      if (this.offline()) {
        throw new Error("Must be online when making offline");
      }
    }
    this.offline.set(true);
  }

  private makeOnline() {
    if (process.env.NODE_ENV === "development") {
      if (!this.offline()) {
        throw new Error("Must be offline when making online");
      }
    }
    this.offline.set(false);
  }

  /**
   * Useful for debugging purposes
   */
  //@ts-ignore
  private printDebug() {
    let info = {
      pendingRequests: this.nRequests(),
      timerId: this.timerId,
      offline: this.offline(),
    };
    console.log(JSON.stringify(info, null, 2));
  }
}
