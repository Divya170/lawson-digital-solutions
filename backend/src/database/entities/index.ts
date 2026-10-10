import { CaseStudy } from './case-study.entity';
import { ContentBlock } from './content-block.entity';
import { Enquiry } from './enquiry.entity';
import { Service } from './service.entity';
import { SiteSettings } from './site-settings.entity';
import { StaffUser } from './staff-user.entity';

export { CaseStudy, ContentBlock, Enquiry, Service, SiteSettings, StaffUser };
export type { CaseStudyStatus } from './case-study.entity';
export type { EnquiryStatus } from './enquiry.entity';

export const ENTITIES = [Service, ContentBlock, Enquiry, CaseStudy, SiteSettings, StaffUser];
