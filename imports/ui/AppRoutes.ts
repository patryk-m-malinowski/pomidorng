import { Component } from "@angular/core";
import { Introduction } from "./Introduction";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { Routes, UrlMatcher, UrlSegment } from "@angular/router";
import { LoginForm } from "./LoginForm";
import { MainUI } from "./MainUI";
import { RegistrationForm } from "./RegistrationForm";

@Component({
  standalone: true,
  selector: "pom-not-found",
  template: `<div>Page not found</div>`,
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
