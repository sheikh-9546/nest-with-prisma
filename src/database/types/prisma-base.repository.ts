// import { PrismaService } from '@api/database/prisma.service';
// import { Prisma } from '@prisma/client';

// /**
//  * PrismaBaseRepository
//  *
//  * A generic repository class for performing CRUD operations using Prisma.
//  */

// export class PrismaBaseRepository {
//     constructor(
//         protected readonly prismaService: PrismaService,
//         protected readonly model: Prisma.ModelName,
//     ) {}

//     /**
//      * Finds a single record by its ID.
//      *
//      * @param {string} id - The ID of the record to find.
//      * @returns {Promise<any>} A promise that resolves to the found record or `null` if not found.
//      */
//     async findById(id: string): Promise<any> {
//         return this.prismaService.client[this.model].findFirst({ where: { id } });
//     }

//     /**
//      * Creates a new record.
//      *
//      * @param {any} data - The data for the new record.
//      * @returns {Promise<any>} A promise that resolves to the created record.
//      */
//     async create(data: any): Promise<any> {
//         return this.prismaService.client[this.model].create({ data });
//     }

//     /**
//      * Creates multiple new records.
//      *
//      * @param {any[]} data - An array of data for the new records.
//      * @returns {Promise<number>} A promise that resolves to the number of records created.
//      */
//     async createMany(data: any[]): Promise<number> {
//         return this.prismaService.client[this.model].createMany({ data });
//     }

//     /**
//      * Updates an existing record by its ID.
//      *
//      * @param {string} id - The ID of the record to update.
//      * @param {any} data - The new data for the record.
//      * @returns {Promise<any>} A promise that resolves to the updated record.
//      */
//     async update(id: string, data: any, include = {}): Promise<any> {
//         return this.prismaService.client[this.model].update({ where: { id }, data, include });
//     }

//     /**
//      * Soft deletes a record by setting its `deletedAt` field to the current date.
//      *
//      * @param {string} id - The ID of the record to softly delete.
//      * @returns {Promise<any>} A promise that resolves to the updated record.
//      */
//     async destroy(id: string): Promise<any> {
//         return this.prismaService.client[this.model].update({ where: { id }, data: { deletedAt: new Date() } });
//     }

//     /**
//      * Deletes a record permanently by its ID.
//      *
//      * @param {string} id - The ID of the record to delete.
//      * @returns {Promise<any>} A promise that resolves to the deleted record.
//      */
//     async delete(id: string): Promise<any> {
//         return this.prismaService.client[this.model].delete({ where: { id } });
//     }

//     /**
//      * Finds multiple records based on the given criteria.
//      *
//      * @param {any} where - The criteria to find records.
//      * @returns {Promise<any[]>} A promise that resolves to an array of found records.
//      */
//     async findMany(where: any): Promise<any[]> {
//         return this.prismaService.client[this.model].findMany({ where });
//     }

//     /**
//      * Finds a single record based on the given criteria.
//      *
//      * @param {any} where - The criteria to find a record.
//      * @returns {Promise<any>} A promise that resolves to the found record or `null` if not found.
//      */
//     async findOne(where: any): Promise<any> {
//         return this.prismaService.client[this.model].findFirst({ where });
//     }

//     /**
//      * Updates multiple records based on the given criteria.
//      *
//      * @param {any} where - The criteria to find records to update.
//      * @param {any} data - The new data for the records.
//      * @returns {Promise<number>} A promise that resolves to the number of records updated.
//      */
//     async updateMany(where: any, data: any): Promise<number> {
//         return this.prismaService.client[this.model].updateMany({ where, data });
//     }

//     /**
//      * Deletes multiple records based on the given criteria.
//      *
//      * @param {any} where - The criteria to find records to delete.
//      * @returns {Promise<number>} A promise that resolves to the number of records deleted.
//      */
//     async deleteMany(where: any): Promise<any> {
//         return this.prismaService.client[this.model].deleteMany({ where });
//     }

//     /**
//      * Creates a new record or updates an existing record based on the given data.
//      *
//      * @param {any} data - The data for the record. Must include an `id` field.
//      * @returns {Promise<any>} A promise that resolves to the created or updated record.
//      */
//     async upsert(data: any): Promise<any> {
//         return this.prismaService.client[this.model].upsert({ where: { id: data.id }, create: data, update: data });
//     }
// }
