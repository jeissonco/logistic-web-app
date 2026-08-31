import type { SheetsClient } from '../sheets/types';
import { listDayTabs, resolveDayTab, type DayTab } from '../runsheet/day-tabs';

/** Lists the day tabs in the current month's spreadsheet and maps dates to them. */
export class RunsheetDirectory {
  constructor(private readonly sheets: SheetsClient) {}

  async listDays(ref?: Date): Promise<DayTab[]> {
    return listDayTabs(await this.sheets.listTabs(), ref);
  }

  async resolveTab(targetIso: string, ref?: Date): Promise<string | null> {
    return resolveDayTab(await this.sheets.listTabs(), targetIso, ref);
  }
}
