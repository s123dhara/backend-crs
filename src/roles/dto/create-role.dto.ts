import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;

  @IsArray()
  @IsString({ each: true }) // ensures all array elements are strings
  @Expose()
  permissions: string[];

  @IsString()
  @Expose()
  description: string;
}
