import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MONTHS: Record<string, number> = {
  'Janvier': 0, 'Février': 1, 'Mars': 2, 'Avril': 3, 'Mai': 4, 'Juin': 5,
  'Juillet': 6, 'Août': 7, 'Septembre': 8, 'Octobre': 9, 'Novembre': 10, 'Décembre': 11,
};
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function parseFrDate(dateStr: string): Date | null {
  // Format: "Mer 10 Juin"
  const parts = dateStr.split(' ');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[1]);
  const month = MONTHS[parts[2]];
  if (isNaN(day) || month === undefined) return null;
  return new Date(new Date().getFullYear(), month, day);
}

function formatFrDate(date: Date): string {
  const dayName = DAYS_FR[(date.getDay() + 6) % 7];
  const monthNames = Object.keys(MONTHS);
  return `${dayName} ${date.getDate()} ${monthNames[date.getMonth()]}`;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDates = [0, 1, 2].map(offset => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return formatFrDate(d);
  });

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .in('date', targetDates)
    .eq('reminder_sent', false);

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;
  for (const b of bookings) {
    if (!b.client_email) continue;

    const rdvDate = parseFrDate(b.date);
    if (!rdvDate) continue;

    const diffDays = Math.round((rdvDate.getTime() - today.getTime()) / 86400000);
    const label = diffDays === 0 ? "aujourd'hui" : diffDays === 1 ? 'demain' : 'dans 2 jours';

    const lieu = b.deplacement
      ? `Le barber se déplace chez toi${b.adresse ? ` à <strong>${b.adresse}</strong>` : ''}`
      : `Tu te déplaces chez le barber`;

    await resend.emails.send({
      from: 'Nomad Barber <onboarding@resend.dev>',
      to: b.client_email,
      subject: `Rappel — Ton RDV est ${label} à ${b.time}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <h1 style="font-size: 26px; font-weight: bold; margin-bottom: 4px;">Nomad Barber</h1>
          <p style="color: #888; font-size: 13px; margin-bottom: 32px;">Rappel de rendez-vous</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Bonjour <strong>${b.client_nom || 'client'}</strong>,
          </p>

          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
            Ton rendez-vous <strong>${b.service}</strong> est ${label} :<br>
            <strong style="font-size: 20px;">${b.date} à ${b.time}</strong>
          </p>

          <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 32px; font-size: 14px; color: #444;">
            📍 ${lieu}
          </div>

          <p style="font-size: 14px; color: #888; line-height: 1.6;">
            En cas d'empêchement, préviens Nomad Barber dès que possible.<br>
            À très vite !
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="font-size: 12px; color: #bbb;">Nomad Barber · Loire-Atlantique</p>
        </div>
      `,
    });

    await supabase.from('bookings').update({ reminder_sent: true }).eq('id', b.id);
    sent++;
  }

  return NextResponse.json({ sent });
}
