import { NextRequest, NextResponse } from 'next/server';
import { isCurrencyCode } from '@/lib/currency-format';
import { getCurrencySettings, updateCurrencySettings } from '@/lib/site-settings-store';

export async function GET() {
  try {
    const settings = await getCurrencySettings({ refreshIfStale: true });
    return NextResponse.json(settings, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (!isCurrencyCode(body.activeCurrency)) {
      return NextResponse.json({ message: 'Invalid currency' }, { status: 400 });
    }

    const settings = await updateCurrencySettings({
      activeCurrency: body.activeCurrency,
      refreshRate: Boolean(body.refreshRate),
    });

    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update settings.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

