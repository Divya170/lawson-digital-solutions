import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ContentBlock, Service, SiteSettings } from '../database/entities';
import { AdminContentController, PublicContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ContentBlock, SiteSettings]), AuthModule],
  controllers: [PublicContentController, AdminContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
