import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

/**
 * 创建会话 DTO
 */
export class CreateSessionDto {
  @IsUUID()
  @IsOptional()
  workflowId?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  title?: string;
}

/**
 * 发送消息 DTO
 */
export class SendMessageDto {
  @IsString()
  content: string;
}
