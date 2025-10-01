import { IsString, Length } from 'class-validator';

export class CreateUserDto {
  id: string;

  @IsString({ message: 'Nome deve ser uma string.' })
  @Length(5, 255, { message: 'Nome deve ter de 5 até 255 caracteres.' })
  name: string;

  @IsString({ message: 'Email deve ser uma string.' })
  @Length(5, 255, { message: 'Email deve ter de 5 até 255 caracteres.' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string.' })
  @Length(5, 255, { message: 'Senha deve ter de 5 até 255 caracteres.' })
  password: string;

  salt: string;
}
