import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class ItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;

  @IsOptional()
  @IsInt()
  unitCost: number;

  @IsBoolean()
  @IsNotEmpty()
  supply: boolean;
}

export class RemoveItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
