import {
  ApplicationConfig,
  ErrorHandler,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";

import { GlobalErrorHandler } from "./GlobalErrorHandler";
import { routes } from "./AppRoutes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
