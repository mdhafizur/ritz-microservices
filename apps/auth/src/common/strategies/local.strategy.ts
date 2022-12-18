import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthUsersService } from '../../services/auth-users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authUsersService: AuthUsersService) {
    super({ usernameField: 'userName' });
  }

  async validate(userName: string, password: string) {
    return this.authUsersService.validateUser(userName, password);
  }
}
