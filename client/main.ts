import { bootstrapApplication } from "@angular/platform-browser";
import { Meteor } from "meteor/meteor";
import { App } from "#pomidor/ui/App";
import { appConfig } from "#pomidor/ui/AppConfig";
import "./main.css";

Meteor.startup(() => {
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
});
