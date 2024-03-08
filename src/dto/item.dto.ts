import { IsString, IsNotEmpty, IsInt, IsBoolean } from 'class-validator';

export class ItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsBoolean()
  @IsNotEmpty()
  supply: boolean;
}
