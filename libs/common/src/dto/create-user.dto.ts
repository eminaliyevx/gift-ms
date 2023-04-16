import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import {
  IsEmail,
  IsIn,
  IsMobilePhone,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsMobilePhone("az-AZ")
  phone: string;

  @ApiProperty()
  @MinLength(8)
  @MaxLength(256)
  password: string;

  @ApiProperty({ enum: Role })
  @IsIn(Object.values(Role))
  role: Role;
}
