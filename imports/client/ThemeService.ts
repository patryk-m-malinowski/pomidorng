import { computed, effect, Injectable, signal } from "@angular/core";
const darkClassName = "com-patrykmalinowski-avocado-dark-theme";

/**
 * The options that the user can select.
 */
export const THEMES = {
  system: {
    title: "System Default",
    icon: "computer",
  },
  light: {
    title: "Light",
    icon: "light_mode",
  },
  dark: {
    title: "Dark",
    icon: "dark_mode",
  },
};

export type ThemeId = keyof typeof THEMES;

@Injectable({ providedIn: "root" })
export default class ThemeService {
  public userChoice = signal<ThemeId>(
    (window.localStorage.getItem("pomidor.theme") as ThemeId) || "system",
  );
  public activeTheme = computed(() => {
    let systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : ("light" as "dark" | "light");
    return this.userChoice() == "system" ? systemTheme : this.userChoice();
  });
  constructor() {
    effect(() => {
      window.localStorage.setItem("pomidor.theme", this.userChoice());
    });
    effect(() => {
      document.body.classList.remove(darkClassName);
      if (this.activeTheme() == "dark") {
        document.body.classList.add(darkClassName);
      }
    });
  }
}
