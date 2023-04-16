import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

export class CreateBusinessDto extends CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
}
