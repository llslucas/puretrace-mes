import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { Either, Schema } from 'effect';
import { TreeFormatter } from 'effect/ParseResult';

export class EffectValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (!metadata.metatype) {
      return value;
    }

    const schema = metadata.metatype as unknown as Schema.Schema<unknown>;

    const program = Schema.decodeUnknownEither(schema)(value);

    if (Either.isLeft(program)) {
      const error = program.left;
      const message = TreeFormatter.formatError(error);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: message,
      });
    }

    return program.right;
  }
}
