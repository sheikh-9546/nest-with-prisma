// import { Patch, UseInterceptors, applyDecorators } from "@nestjs/common";
// import { AmazonS3FileInterceptor, MulterExtendedOptions } from 'nestjs-multer-extended';
// import { ApiFile } from "./file-property.decorator";

// export const MultipartImageUpload = (restHttp, localOption?: MulterExtendedOptions): MethodDecorator =>
//   applyDecorators(
//       Patch(restHttp),
//       UseInterceptors(
//           AmazonS3FileInterceptor('file', {
//               ...localOption,
//               resize: { height: 180, width: 180 },
//               randomFilename: false,
//           }),
//       ),
//       ApiFile('file'),
//   );