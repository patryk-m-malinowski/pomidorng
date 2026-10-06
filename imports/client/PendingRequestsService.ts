import { Injectable, WritableSignal } from "@angular/core";
import { CallTracker } from "./CallTracker";

@Injectable({ providedIn: "root" })
export default class PendingRequestsService {
  private tracker: CallTracker;

  constructor() {
    this.tracker = monkeyPatchCallAsync();
  }
  public get pendingRequests(): WritableSignal<number> {
    return this.tracker.nRequests;
  }
  public get offline(): WritableSignal<boolean> {
    return this.tracker.offline;
  }
}

function monkeyPatchCallAsync() {
  let tracker = new CallTracker(5000);
  let impl = Meteor.callAsync;
  function newImpl(this: any): typeof Meteor.callAsync {
    tracker.beginRequest();
    let promise = impl.apply(this, arguments as any);
    promise.finally(() => tracker.endRequest());
    return promise as any;
  }
  Meteor.callAsync = newImpl as any;
  return tracker;
}
