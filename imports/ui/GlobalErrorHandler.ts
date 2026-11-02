import { ErrorHandler, Injectable } from "@angular/core";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  static listener?: (error: unknown) => void;

  handleError(error: unknown): void {
    console.error(error);
    GlobalErrorHandler.listener?.(error);
  }
}
