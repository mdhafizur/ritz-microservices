import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDTO {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiProperty({ type: String })
  @IsDefined()
  @IsString()
  userName: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsPhoneNumber()
  phone: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsDate()
  dateOfBirth: Date;

  @ApiProperty({ type: String })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsNotEmpty({
    message: 'Promo Code should not be empty.',
  })
  @IsString()
  promoCode?: string;
}
