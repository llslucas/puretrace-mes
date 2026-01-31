import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { Either, Schema } from 'effect';

export class EffectValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (!metadata.metatype) {
      return value;
    }

    const schema = metadata.metatype as unknown as Schema.Schema<unknown>;

    const program = Schema.decodeUnknownEither(schema)(value);

    if (Either.isLeft(program)) {
      const error = program.left;
      throw new BadRequestException({
        message: 'Validation failed',
        errors: error,
      });
    }

    return program.right;
  }
}
