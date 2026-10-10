import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { StaffAuthGuard } from '../auth/staff-auth.guard';
import { str } from '../common/utils';
import { CaseStudiesService } from './case-studies.service';

@Controller('case-studies')
export class PublicCaseStudiesController {
  constructor(private readonly cases: CaseStudiesService) {}

  @Get()
  list() {
    return this.cases.listPublished();
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.cases.getPublished(slug);
  }
}

@UseGuards(StaffAuthGuard)
@Controller('admin/case-studies')
export class AdminCaseStudiesController {
  constructor(private readonly cases: CaseStudiesService) {}

  @Get()
  list(@Query() q: Record<string, unknown>) {
    return this.cases.listAdmin(q);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.cases.getAdmin(id);
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.cases.save(null, body || {});
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return this.cases.save(id, body || {});
  }

  @Patch(':id/status')
  status(@Param('id', ParseIntPipe) id: number, @Body() body: Record<string, unknown>) {
    return this.cases.setStatus(id, str(body?.status));
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cases.remove(id);
  }
}
