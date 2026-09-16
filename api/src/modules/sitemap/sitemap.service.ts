import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Company } from '@modules/company/company.entity';
import { Destination } from '@modules/destination/destination.entity';

@Injectable()
export class SitemapService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    private readonly configService: ConfigService,
  ) {}

  public async generate(): Promise<string> {
    const [destinations, companies] = await Promise.all([
      this.destinationRepository
        .createQueryBuilder('destination')
        .select('destination.slug', 'slug')
        .where('destination.isActive = :isActive', { isActive: true })
        .andWhere('destination.slug IS NOT NULL')
        .getRawMany<{ slug: string }>(),
      this.companyRepository
        .createQueryBuilder('company')
        .select('company.slug', 'slug')
        .where('company.isActive = :isActive', { isActive: true })
        .andWhere('company.slug IS NOT NULL')
        .getRawMany<{ slug: string }>(),
    ]);
    const webUrl = (this.configService.get<string>('WEB_URL') ?? '').replace(
      /\/$/,
      '',
    );
    const urls = [
      `${webUrl}/`,
      ...destinations.map(
        (destination) =>
          `${webUrl}/destinations/${encodeURIComponent(destination.slug)}`,
      ),
      ...companies.map(
        (company) =>
          `${webUrl}/cruise-lines/${encodeURIComponent(company.slug)}`,
      ),
    ];
    const entries = urls
      .map((url) => `  <url><loc>${this.escapeXml(url)}</loc></url>`)
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
  }

  private escapeXml(value: string): string {
    return value.replace(/[<>&'\"]/g, (character) => {
      const replacements: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
      };
      return replacements[character];
    });
  }
}
