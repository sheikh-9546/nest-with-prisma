import { PrismaService } from '@api/database/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(email: string, args: ValidationArguments): Promise<boolean> {
    console.log('dddd', this.prisma);
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return !user;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Email ($value) already exists. Please use a different email.';
  }
}

export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailUniqueConstraint,
    });
  };
}
