import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  Version,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Response } from 'express';
import { Tokens } from '../types';
import { SignupDTO } from '../dto/sign-up.dto';
import { ApiOperation, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { GetCurrentUser, Public } from '../common/decorators';
import { SignInDTO } from '../dto/signin.dto';
import { JwtAuthGuard } from '@app/common';
import { AppUser } from 'apps/app/prisma/generated/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  getHello(@Req() req?: any): any {
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

  @Public()
  @Version('1')
  @Post('login')
  async signinLocal(
    @Body() signInDTO: SignInDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.signinLocal(signInDTO, response);
  }

  @Public()
  @Version('1')
  @Get('users/:uuid')
  @UseGuards(JwtAuthGuard)
  async getUser(@CurrentUser() user: AppUser, @Param('uuid') uuid: string) {
    console.log(user);
    return await this.authService.getUser(uuid);
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('validate-user')
  async validateUser(@GetCurrentUser() user: any) {
    return user;
  }
}
