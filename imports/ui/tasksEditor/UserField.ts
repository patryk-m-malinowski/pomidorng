import { Component, computed, effect, input, signal } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import type { PomidorUser } from "#pomidor/data/users/PomidorUser";
import { pomidorUsers } from "#pomidor/db/users/PomidorUsers";
import { asyncComputedSignal } from "../../client/util/asyncComputedSignal";

/**
 * Shows the name of a user (and optionally a coloured icon) given the user's ID.
 */
@Component({
  selector: "pom-user-field",
  standalone: true,
  imports: [MatIcon],
  template: `
    <div [class]="'flex gap-1 items-center ' + className()">
      @if (showIcon()) {
        <mat-icon [style.color]="color()">account_circle</mat-icon>
      }
      <span class="flex-1 overflow-hidden text-ellipsis text-nowrap">
        {{ text() }}
      </span>
    </div>
  `,
})
export class UserField {
  readonly userId = input.required<string>();
  readonly showIcon = input(true);
  readonly className = input("");

  private readonly user = asyncComputedSignal<string, PomidorUser | null>(
    this.userId,
    async (id) => (id ? ((await pomidorUsers.findOneAsync(id)) as any) : null),
  );

  readonly color = computed(() => idToColor(this.userId()));
  readonly text = computed(() => {
    const { value, pending } = this.user();
    if (pending) return "(loading...)";
    return value ? value.username : "(deleted user)";
  });
}

function idToColor(id: string): string {
  // FNV-1a 32-bit hash
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash >>>= 0;

  // Spread bits across HSL components
  const h = hash % 360;
  const s = 55 + ((hash >>> 9) % 36); // 55–90%
  const l = 40 + ((hash >>> 18) % 21); // 40–60%
  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
