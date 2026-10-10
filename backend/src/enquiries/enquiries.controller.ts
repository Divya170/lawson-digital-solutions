import { Body, Controller, Delete, Get, Header, HttpCode, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { StaffAuthGuard } from '../auth/staff-auth.guard';
import { ENQUIRY_STATUSES, EnquiriesService } from './enquiries.service';

/** Public project-enquiry submission. */
@Controller('enquiries')
export class PublicEnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  /** 5 enquiries per 10 minutes per IP (the form shows a "too many attempts" message on 429). */
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @Post()
  @HttpCode(201)
  create(@Body() body: Record<string, unknown>) {
    return this.enquiries.create(body);
  }
}

@UseGuards(StaffAuthGuard)
@Controller('admin/enquiries')
export class AdminEnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Get()
  list(@Query() q: Record<string, unknown>) {
    return this.enquiries.list(q);
  }

  @Get('statuses')
  statuses() {
    return ENQUIRY_STATUSES;
  }

  /** Download the current filter as CSV (opens in Excel / Google Sheets). */
  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async export(@Query() q: Record<string, unknown>, @Res({ passthrough: true }) res: Response) {
    const day = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Disposition', `attachment; filename="enquiries-${day}.csv"`);
    return this.enquiries.csv(q);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.enquiries.get(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.enquiries.update(id, body || {});
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enquiries.remove(id);
  }
}
