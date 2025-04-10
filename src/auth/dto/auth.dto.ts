import { IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsString,  } from "class-validator";

export class AuthDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email : string

    // @IsString()
    @IsNotEmpty()
    @IsNumberString()
    password : string
}