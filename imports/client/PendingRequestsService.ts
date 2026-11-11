import { Injectable, WritableSignal } from "@angular/core";
import { CallTracker } from "./CallTracker";

@Injectable({ providedIn: "root" })
export default class PendingRequestsService {
  private tracker: CallTracker = new CallTracker(7000);

  constructor() {
    monkeyPatchCallAsync(this.tracker);
  }
  public get pendingRequests(): WritableSignal<number> {
    return this.tracker.nRequests;
  }
  public get offline(): WritableSignal<boolean> {
    return this.tracker.offline;
  }
}

function monkeyPatchCallAsync(tracker: CallTracker) {
  let impl = Meteor.callAsync;
  function newImpl(this: any): typeof Meteor.callAsync {
    tracker.beginRequest();
    let promise = impl.apply(this, arguments as any);
    promise.finally(() => tracker.endRequest());
    return promise as any;
  }
  Meteor.callAsync = newImpl as any;
}
