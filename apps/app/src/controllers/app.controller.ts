import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators';

@Public()
@Controller()
export class AppController {
  @Get()
  getHello(): any {
    return 'Ritz Main API';
  }
}
