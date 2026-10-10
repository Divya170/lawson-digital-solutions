import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ContentModule } from '../content/content.module';
import { Enquiry } from '../database/entities';
import { AdminEnquiriesController, PublicEnquiriesController } from './enquiries.controller';
import { EnquiriesService } from './enquiries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Enquiry]), ContentModule, AuthModule],
  controllers: [PublicEnquiriesController, AdminEnquiriesController],
  providers: [EnquiriesService],
  exports: [EnquiriesService],
})
export class EnquiriesModule {}
