import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
    @IsOptional()
    @IsString()
    @Expose()
    name?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Expose()
    permissions?: string[];

    @IsOptional()
    @IsString()
    @Expose()
    description?: string;
}
