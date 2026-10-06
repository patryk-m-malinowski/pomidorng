import { Component } from "@angular/core";
import { Routes, UrlMatcher, UrlSegment } from "@angular/router";
import { LoginFormComponent } from "./LoginFormComponent";
import { MainUI } from "./MainUI";

@Component({
  standalone: true,
  template: `<div>Registration Form</div>`,
})
class RegistrationFormComponent {}

@Component({
  standalone: true,
  template: `<div>Privacy Policy</div>`,
})
class PrivacyPolicyComponent {}

@Component({
  standalone: true,
  template: `<div>Introduction</div>`,
})
class IntroductionComponent {}

@Component({
  standalone: true,
  template: `<div>Page not found</div>`,
})
class NotFoundComponent {}

const appWildcardMatcher: UrlMatcher = (segments: UrlSegment[]) => {
  if (segments.length > 0 && segments[0].path === "app") {
    return { consumed: segments };
  }

  return null;
};

export const routes: Routes = [
  { path: "register", component: RegistrationFormComponent },
  { path: "", pathMatch: "full", component: LoginFormComponent },
  { matcher: appWildcardMatcher, component: MainUI },
  { path: "privacy-policy", component: PrivacyPolicyComponent },
  { path: "introduction", component: IntroductionComponent },
  { path: "**", component: NotFoundComponent },
];
