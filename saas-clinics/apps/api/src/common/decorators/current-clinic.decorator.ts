import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentClinic = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.clinic_id;
  },
);
