import { AccessTokenGuard } from './../common/guards/access-token.guard';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  Version,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../common/guards';
import { Response } from 'express';
import { Tokens } from '../types';
import { SignupDTO } from '../dtos/sign-up.dto';
import { ApiOperation, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { Public } from '../common/decorators';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  getHello(@Req() req: any): any {
    console.log(req.user);
    return this.authService.getHello(req.body);
  }

  @Public()
  @Post('signup')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register an user' })
  @ApiOkResponse({
    status: HttpStatus.CREATED,
    description: 'An user has been successfully signed up',
    // type: JwtResponse,
  })
  @ApiBody({
    type: SignupDTO,
    description: 'User Sign Up',
  })
  signupLocal(@Body() signupDTO: SignupDTO): Promise<Tokens> {
    return this.authService.signupLocal(signupDTO);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.loginLocal(user, response);
    response.send(user);
  }

  @UseGuards(AccessTokenGuard)
  @MessagePattern('validate_user')
  async validateUser(@CurrentUser() user: any) {
    return user;
  }
}
