import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  base() {
    return {
      message: 'Welcome to the API',
      data: null,
    };
  }
}
