import { PrismaService } from '@api/database/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Messages } from '@api/constants/messages';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsRoleExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(roleId: number, args: ValidationArguments): Promise<boolean> {
    if (!roleId) {
      return false; // Let required validation handle this
    }

    try {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });
      
      return Boolean(role);
    } catch (error) {
      console.error('Role validation error:', error);
      return false; // Fail validation if database error occurs
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return Messages.Role.Error.IS_ROLE_NOT_FOUND(args.value);
  }
}

export function IsRoleExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRoleExistsConstraint,
    });
  };
}
