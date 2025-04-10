import { isEmail, IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsString,  } from "class-validator";
import { Expose } from "class-transformer";
export class CreateUserDto {
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email : string

    @Expose({name : 'password'})
    @IsString()
    @IsNotEmpty()
    password_hash : string
}
