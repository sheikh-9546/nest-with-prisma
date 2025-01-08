import { plainToInstance, instanceToPlain } from 'class-transformer';

export class SerializerUtil {
  static serialize<T>(data: any, model: new () => T): Record<string, any> {
    // Convert the plain object (data) into an instance of the model class
    const instance = plainToInstance(model, data, {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
    });

    // Convert the instance back into a plain object, including computed properties
    return instanceToPlain(instance);
  }
}
