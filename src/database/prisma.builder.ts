import { Prisma } from '@prisma/client';

/**
 * Abstract class representing a builder for Prisma entities.
 * @template T - The type of the entity being built.
 */
export abstract class PrismaBuilder<T> {
  protected entity: Partial<T>;

  /**
   * Constructs a new PrismaBuilder.
   * @param {Prisma.ModelName} modelName - The name of the Prisma model.
   * @throws Will throw an error if the model is not found in the Prisma schema.
   */
  protected constructor(modelName: Prisma.ModelName) {
    this.entity = PrismaBuilder.initializeFields<T>(modelName);
  }

  /**
   * Gets the default value for a given Prisma type.
   * @param {string} type - The Prisma type.
   * @returns {any} The default value for the type.
   */
  protected static getDefaultValue(type: string): any {
    switch (type) {
      case 'String':
        return '';
      case 'Boolean':
        return false;
      case 'Int':
        return 0;
      case 'Float':
        return 0.0;
      case 'DateTime':
        return new Date();
      case 'Json':
        return {};
      case 'Decimal':
        return new Prisma.Decimal(0);
      default:
        return null;
    }
  }

  /**
   * Initializes embedded fields for a given type.
   * @param {any} type - The type of the field.
   * @param {boolean} isList - Whether the field is a list.
   * @returns {any} The initialized embedded field.
   */
  protected static initializeEmbeddedFields(type: any, isList: boolean): any {
    if (isList) {
      return [];
    }

    if (type.kind === 'object' && type.fields) {
      const embeddedObject: any = {};
      type.fields.forEach((field: any) => {
        embeddedObject[field.name] = PrismaBuilder.getDefaultValue(field.type);
      });
      return embeddedObject;
    }

    return null;
  }

  /**
   * Initializes the fields of a model with default values.
   * @template T
   * @param {string} modelName - The name of the model.
   * @returns {Partial<T>} The initialized fields.
   * @throws Will throw an error if the model is not found in the Prisma schema.
   */
  protected static initializeFields<T>(modelName: string): Partial<T> {
    const model = Prisma.dmmf.datamodel.models.find(
      (m) => m.name === modelName,
    );
    if (!model) {
      throw new Error(`Model ${modelName} not found in the Prisma schema`);
    }

    const attributes: any = {};
    model.fields.forEach((field: any) => {
      if (field.type.startsWith('Embedded')) {
        attributes[field.name] = PrismaBuilder.initializeEmbeddedFields(
          field.type,
          field.isList,
        );
      } else if (field.kind == 'scalar' && !field.isRequired) {
        attributes[field.name] =
          field.hasDefaultValue && !field.isId && field.type !== 'DateTime'
            ? field.default
            : null;
      }
    });

    return attributes as Partial<T>;
  }

  /**
   * Abstract method to build the entity.
   * @returns {T} The built entity.
   */
  abstract build(): T;
}
