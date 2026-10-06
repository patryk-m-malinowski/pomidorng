import { Component } from "@angular/core";
import { Routes, UrlMatcher, UrlSegment } from "@angular/router";
import { LoginForm } from "./LoginForm";
import { MainUI } from "./MainUI";

@Component({
  standalone: true,
  template: `<div>Registration Form</div>`,
})
class RegistrationForm {}

@Component({
  standalone: true,
  template: `<div>Privacy Policy</div>`,
})
class PrivacyPolicy {}

@Component({
  standalone: true,
  template: `<div>Introduction</div>`,
})
class Introduction {}

@Component({
  standalone: true,
  template: `<div>Page not found</div>`,
})
class NotFound {}

const appWildcardMatcher: UrlMatcher = (segments: UrlSegment[]) => {
  if (segments.length > 0 && segments[0].path === "app") {
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
