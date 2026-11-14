import type { Document } from "#pomidor/data/Document";
import MsoObject from "#pomidor/common/mso/MsoObject";

@MsoObject.Meta({
  collectionName: "tasks.Task",
})
export class Task extends MsoObject {
  //ID of user who created the task
  @MsoObject.Property({ init: null })
  declare createdBy: string;
  //ID of user who is assigned to the task
  @MsoObject.Property({ init: null })
  declare assignedTo: string | null;
  @MsoObject.Property({ init: "" })
  declare title: string;
  @MsoObject.Property({ init: "" })
  declare description: string;
  @MsoObject.Property({ init: "todo" })
  declare status: "todo" | "inProgress" | "done";
}
