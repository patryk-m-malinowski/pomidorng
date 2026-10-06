import { bootstrapApplication } from "@angular/platform-browser";
import { Meteor } from "meteor/meteor";
import { App } from "/imports/ui/App";
import { appConfig } from "/imports/ui/AppConfig";
import "zone.js";
import "./main.css";

Meteor.startup(() => {
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
});
