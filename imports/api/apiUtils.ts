import { getPomidorUserAsync } from '/imports/db/users/PomidorUsers';

export async function isAdmin(): Promise<boolean> {
  return !!(await getPomidorUserAsync())?.isAdmin;
}