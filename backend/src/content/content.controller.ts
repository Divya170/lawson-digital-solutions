import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { StaffAuthGuard } from '../auth/staff-auth.guard';
import { ContentService } from './content.service';

@Controller()
export class PublicContentController {
  constructor(private readonly content: ContentService) {}

  /** Contact details for the header, footer, contact and about pages. */
  @Get('site')
  site() {
    return this.content.site();
  }

  /** Services and all structured page content. */
  @Get('content')
  all() {
    return this.content.content();
  }

  @Get('services')
  services() {
    return this.content.listServices();
  }
}

@UseGuards(StaffAuthGuard)
@Controller('admin')
export class AdminContentController {
  constructor(private readonly content: ContentService) {}

  @Get('services')
  services() {
    return this.content.listServices();
  }

  @Put('services/:id')
  updateService(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.content.updateService(id, body || {});
  }

  @Get('settings')
  settings() {
    return this.content.site();
  }

  @Put('settings')
  updateSettings(@Body() body: Record<string, unknown>) {
    return this.content.updateSettings(body || {});
  }
}
