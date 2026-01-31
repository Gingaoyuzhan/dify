import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * 创建知识库 DTO
 */
export class CreateKnowledgeBaseDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * 更新知识库 DTO
 */
export class UpdateKnowledgeBaseDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * 创建文档 DTO
 */
export class CreateDocumentDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  source?: string;
}
