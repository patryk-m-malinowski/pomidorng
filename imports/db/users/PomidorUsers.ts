import type { Mongo } from "meteor/mongo";
import type { PomidorUser } from "../../data/users/PomidorUser";
import { Meteor } from "meteor/meteor";

export const pomidorUsers =
  Meteor.users as any as Mongo.Collection<PomidorUser>;

export function getPomidorUser(): PomidorUser | null {
  return (Meteor.user?.() as PomidorUser | null | undefined) ?? null;
}

export async function getPomidorUserAsync(): Promise<PomidorUser | null> {
  if (!Meteor.userAsync) {
    return getPomidorUser();
  }

  return (await Meteor.userAsync()) as PomidorUser | null;
}
