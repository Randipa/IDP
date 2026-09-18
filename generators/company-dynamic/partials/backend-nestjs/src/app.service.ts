import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; service: string } {
    return {
      message: 'NestJS API is running',
      service: '{{name}}',
    };
  }
}
