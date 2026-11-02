import { getPomidorUserAsync } from "#pomidor/db/users/PomidorUsers";

export async function isAdmin(): Promise<boolean> {
  return !!(await getPomidorUserAsync())?.isAdmin;
}
