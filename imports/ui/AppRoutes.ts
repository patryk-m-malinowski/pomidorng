import { Component } from "@angular/core";
import { Routes, UrlMatcher, UrlSegment } from "@angular/router";
import { LoginForm } from "./LoginForm";
import { MainUI } from "./MainUI";
import { RegistrationForm } from "./RegistrationForm";

@Component({
  standalone: true,
  selector: "app-privacy-policy",
  template: `<div>Privacy Policy</div>`,
})
class PrivacyPolicy {}

@Component({
  standalone: true,
  selector: "app-introduction",
  template: `<div>Introduction</div>`,
})
class Introduction {}

@Component({
  standalone: true,
  selector: "app-not-found",
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
