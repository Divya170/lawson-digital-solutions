import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ContentModule } from '../content/content.module';
import { CaseStudy } from '../database/entities';
import { AdminCaseStudiesController, PublicCaseStudiesController } from './case-studies.controller';
import { CaseStudiesService } from './case-studies.service';

@Module({
  imports: [TypeOrmModule.forFeature([CaseStudy]), ContentModule, AuthModule],
  controllers: [PublicCaseStudiesController, AdminCaseStudiesController],
  providers: [CaseStudiesService],
  exports: [CaseStudiesService],
})
export class CaseStudiesModule {}
