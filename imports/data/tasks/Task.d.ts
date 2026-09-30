import type { Document } from "/imports/data/Document";

export interface Task extends Document {
  //ID of user who created the task
  createdBy: string,
  //List of IDs of users who are assigned to the task
  assignedTo: string | null,
  title: string,
  description: string,
  status: "todo" | "inProgress" | "done",
  dateModified: Date | null
}