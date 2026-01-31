import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * 数据库配置
 * 使用 PostgreSQL + pgvector 支持向量检索
 */
export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'coze_demo',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  // 开启 synchronize，自动同步表结构
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});
