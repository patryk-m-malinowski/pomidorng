import { Component } from "@angular/core";
import { Introduction } from "./Introduction";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { RouterLink, Routes, UrlMatcher, UrlSegment } from "@angular/router";
import { LoginForm } from "./LoginForm";
import { MainUI } from "./MainUI";
import { RegistrationForm } from "./RegistrationForm";

@Component({
  standalone: true,
  selector: "pom-not-found",
  imports: [RouterLink],
  host: { class: "p-1" },
  template: `
    <div>Page not found.</div>
    <a routerLink="/">Back to Home</a>
  `,
})
class NotFound {}

const appWildcardMatcher: UrlMatcher = (segments: UrlSegment[]) => {
  if (segments.length > 0 && segments[0].path === "pomidorapp") {
    return { consumed: segments };
  }

  return null;
};

export const routes: Routes = [
  { path: "register", component: RegistrationForm },
  { path: "", pathMatch: "full", component: LoginForm },
  { matcher: appWildcardMatcher, component: MainUI },
  { path: "privacy-policy", component: PrivacyPolicy },
  { path: "introduction", component: Introduction },
  { path: "**", component: NotFound },
];
