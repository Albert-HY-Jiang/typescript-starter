import { IsArray, IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { Type } from 'class-transformer';

export enum EventStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(EventStatus)
  status: EventStatus;

  @IsISO8601()
  startTime: string;

  @IsISO8601()
  endTime: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Type(() => Number)
  invitees: number[];
}