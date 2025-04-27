import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignInDTO {
  @ApiProperty({ type: String })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({ type: String })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password: string;

  // TODO: make this required
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  userType?: string;
}
