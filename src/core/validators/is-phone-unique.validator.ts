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

export interface PhoneValidationArgs {
  countryCode: string;
  phoneNumber: string;
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsPhoneUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(phoneNumber: string, args: ValidationArguments): Promise<boolean> {
    const object = args.object as any;
    const countryCode = object.countryCode;
    
    if (!countryCode || !phoneNumber) {
      return true; // Let other validators handle required validation
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          unique_phone: {
            countryCode,
            phoneNumber,
          },
        },
      });
      
      return !user;
    } catch (error) {
      console.error('Phone validation error:', error);
      return false; // Fail validation if database error occurs
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const object = args.object as any;
    const fullPhoneNumber = `${object.countryCode}${args.value}`;
    return Messages.User.Error.PHONE_NUMBER_ALREADY_EXISTS(fullPhoneNumber);
  }
}

export function IsPhoneUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneUniqueConstraint,
    });
  };
}
