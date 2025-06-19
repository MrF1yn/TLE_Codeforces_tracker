import { validateOrReject, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { MethodBinder } from '../utils';
import { TNonEmptyArray } from '../interfaces';

type TValidationConfig<T> = [
  new (data: T) => object,
  keyof Pick<Request, 'body' | 'query' | 'params'>,
];

export class ValidationMiddleware {
  private validations: TNonEmptyArray<TValidationConfig<any>>;

  constructor(...validations: TNonEmptyArray<TValidationConfig<any>>) {
    MethodBinder.bind(this);
    this.validations = validations;
  }

  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      for (const [DtoClass, target] of this.validations) {
        const dto =
          DtoClass.prototype.constructor.toString() !==
          `class ${DtoClass.name} {\n}`
            ? new DtoClass(req[target])
            : req[target];
        const instance = plainToInstance(DtoClass, dto);
        await validateOrReject(instance, { whitelist: true });
        req[target] = instance;
      }
      next();
    } catch (errors: any) {
      if (Array.isArray(errors) && errors[0] instanceof ValidationError) {
        console.log(errors);
        const errorMessages = this.formatValidationErrors(errors);
        return res.status(400).json({
          success: false,
          message: 'Bad request exception',
          errors: errorMessages,
        });
      }
      next(errors);
    }
  }
  private formatValidationErrors(errors: ValidationError[]): string[] {
    return errors.flatMap((error) => this.extractErrorMessages(error));
  }

  private extractErrorMessages(error: ValidationError): string[] {
    if (error.constraints) {
      return Object.values(error.constraints);
    }
    if (error.children && error.children.length > 0) {
      return error.children.flatMap((childError) =>
        this.extractErrorMessages(childError),
      );
    }
    return [];
  }
}
