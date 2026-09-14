import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '@core/guards/auth.guard';
import { Settings } from '@modules/settings/settings.entity';
import { UpdateSettingsDto } from '@modules/settings/dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(AuthGuard)
  @Get('/')
  async getSettings(): Promise<Settings> {
    return await this.settingsService.getSettings();
  }

  @UseGuards(AuthGuard)
  @Patch('/')
  async updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @Req() req: { user: any },
  ): Promise<Settings> {
    return await this.settingsService.updateSettings(
      updateSettingsDto,
      req.user,
    );
  }
}
