import { NextFunction, Request, Response } from "express";

export function asyncHandler<T extends Request = Request>(
  handler: (request: T, response: Response, next: NextFunction) => Promise<unknown>
) {
  return function wrappedHandler(request: Request, response: Response, next: NextFunction) {
    void (handler as any)(request, response, next).catch(next);
  };
}
