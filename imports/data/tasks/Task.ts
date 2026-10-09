import type { Document } from "/imports/data/Document";
import MsoObject from "/imports/common/mso/MsoObject";

@MsoObject.Meta({
  collectionName: "tasks.Task",
})
export class Task extends MsoObject {
  //ID of user who created the task
  @MsoObject.Property()
  declare createdBy: string;
  //List of IDs of users who are assigned to the task
  @MsoObject.Property()
  declare assignedTo: string | null;
  @MsoObject.Property({ init: "" })
  declare title: string;
  @MsoObject.Property({ init: "" })
  declare description: string;
  @MsoObject.Property({ init: "todo" })
  declare status: "todo" | "inProgress" | "done";
  @MsoObject.Property({ init: null })
  declare dateModified: Date | null;
}
