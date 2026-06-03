import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, nom, service, date, time, deplacement, adresse } = await req.json();

  const lieu = deplacement
    ? `à ton adresse : <strong>${adresse}</strong>`
    : `chez le barber (adresse communiquée à la réservation)`;

  const barberMsg = deplacement
    ? `Le barber se déplace chez toi à <strong>${adresse}</strong>`
    : `Tu te déplaces chez le barber`;

  try {
    await resend.emails.send({
      from: 'Nomad Barber <onboarding@resend.dev>',
      to: email,
      subject: `Rappel RDV — ${service} le ${date} à ${time}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">Nomad Barber</h1>
          <p style="color: #888; font-size: 14px; margin-bottom: 32px;">Rappel de rendez-vous</p>

          <p style="font-size: 16px; margin-bottom: 24px;">Bonjour <strong>${nom}</strong>,</p>

          <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Ton rendez-vous <strong>${service}</strong> est prévu le<br>
            <strong style="font-size: 18px;">${date} à ${time}</strong>
          </p>

          <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
            <p style="margin: 0; font-size: 14px; color: #444;">
              📍 ${deplacement ? `Le barber se déplace ${lieu}` : barberMsg}
            </p>
          </div>

          <p style="font-size: 14px; color: #888;">
            En cas d'empêchement, contacte Nomad Barber dès que possible.<br>
            À bientôt !
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="font-size: 12px; color: #bbb;">Nomad Barber · Loire-Atlantique</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
