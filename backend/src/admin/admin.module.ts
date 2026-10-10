import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StaffAuthGuard } from '../auth/staff-auth.guard';
import { CaseStudiesModule } from '../case-studies/case-studies.module';
import { CaseStudiesService } from '../case-studies/case-studies.service';
import { EnquiriesModule } from '../enquiries/enquiries.module';
import { EnquiriesService } from '../enquiries/enquiries.service';
import { SeedService } from '../seed/seed.service';

@UseGuards(StaffAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly enquiries: EnquiriesService,
    private readonly cases: CaseStudiesService,
  ) {}

  /** Counts for the staff sidebar. */
  @Get('stats')
  async stats() {
    const [e, c] = await Promise.all([this.enquiries.totals(), this.cases.totals()]);
    return { enquiries: { total: e.total, new: e.new }, caseStudies: c };
  }
}

@Module({
  imports: [AuthModule, EnquiriesModule, CaseStudiesModule],
  controllers: [AdminController],
  providers: [SeedService],
  exports: [SeedService],
})
export class AdminModule {}
