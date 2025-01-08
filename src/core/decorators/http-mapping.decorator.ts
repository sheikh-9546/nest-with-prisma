import {
  RequestMapping,
  RestControllerOption,
} from '@api/core/decorators/types/http-mapping.types';
import { SanitizeInterceptor } from '@api/core/interceptors/sanitize.interceptor';
import SharedUtils from '@api/shared/shared.utils';
import {
  applyDecorators,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  SetMetadata,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ReasonPhrases } from 'http-status-codes';

/**
 * Sets a custom response message metadata for the route.
 * @param message - Custom message to be set.
 * @returns A decorator function.
 */
export const ResponseMessage = (message: string): any =>
  SetMetadata('message', message);

/**
 * Custom decorator for REST controllers.
 * @param options - Options to configure the REST controller.
 * @returns A decorator function.
 */
export const RestController = ({
  tag,
  path,
  version = 1,
}: RestControllerOption): any =>
  applyDecorators(
    ApiTags(SharedUtils.toUppercaseFirst(tag)),
    Controller(path ? `api/v${version}/${path}` : `api/v${version}`),
    UseInterceptors(SanitizeInterceptor),
  );

/**
 * Custom decorator for GET routes.
 * @param options - Options to configure the GET route.
 * @returns A decorator function.
 */
export const GetMapping = ({
  path,
  summary,
}: RequestMapping): MethodDecorator =>
  applyDecorators(
    Get(path),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary }),
    ApiOkResponse({ description: ReasonPhrases.OK }),
  );

/**
 * Custom decorator for POST routes.
 * @param options - Options to configure the POST route.
 * @returns A decorator function.
 */
export const PostMapping = ({
  path,
  summary,
}: RequestMapping): MethodDecorator =>
  applyDecorators(
    Post(path),
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ summary }),
    ApiUnprocessableEntityResponse({
      description: ReasonPhrases.UNPROCESSABLE_ENTITY,
    }),
  );

/**
 * Custom decorator for PUT routes.
 * @param options - Options to configure the PUT route.
 * @returns A decorator function.
 */
export const PutMapping = ({
  path,
  summary,
}: RequestMapping): MethodDecorator =>
  applyDecorators(
    Put(path),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary }),
    ApiOkResponse({ description: ReasonPhrases.OK }),
    ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND }),
    ApiUnprocessableEntityResponse({
      description: ReasonPhrases.UNPROCESSABLE_ENTITY,
    }),
  );

/**
 * Custom decorator for DELETE routes.
 * @param options - Options to configure the DELETE route.
 * @returns A decorator function.
 */
export const DeleteMapping = ({
  path,
  summary,
}: RequestMapping): MethodDecorator =>
  applyDecorators(
    Delete(path),
    HttpCode(HttpStatus.NO_CONTENT),
    ApiOperation({ summary }),
    ApiOkResponse({ description: ReasonPhrases.NO_CONTENT }),
  );

/**
 * Custom decorator for PATCH routes.
 * @param options - Options to configure the PATCH route.
 * @returns A decorator function.
 */
export const PatchMapping = ({
  path,
  summary,
}: RequestMapping): MethodDecorator =>
  applyDecorators(
    Patch(path),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary }),
    ApiOkResponse({ description: ReasonPhrases.OK }),
    ApiNotFoundResponse({ description: ReasonPhrases.NOT_FOUND }),
    ApiUnprocessableEntityResponse({
      description: ReasonPhrases.UNPROCESSABLE_ENTITY,
    }),
  );
