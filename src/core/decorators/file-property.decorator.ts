import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export const ApiFiles = (filename: string): MethodDecorator =>
    applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    [filename]: {
                        type: 'array',
                        items: {
                            type: 'string',
                            format: 'binary',
                        },
                    },
                },
            },
        }),
    );

export const ApiFile = (filename: string): MethodDecorator =>
    applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    [filename]: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        }),
    );