import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { barberEmail, clientNom, clientEmail, clientTel, service, price, date, time, deplacement, adresse } = await req.json();

  try {
    await resend.emails.send({
      from: 'Nomad Barber <onboarding@resend.dev>',
      to: barberEmail,
      subject: `📅 Nouveau RDV — ${service} le ${date} à ${time}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <h1 style="font-size: 26px; font-weight: bold; margin-bottom: 4px;">Nomad Barber</h1>
          <p style="color: #888; font-size: 13px; margin-bottom: 32px;">Nouvelle réservation reçue</p>

          <div style="background: #000; color: #fff; border-radius: 14px; padding: 24px; margin-bottom: 28px;">
            <p style="font-size: 13px; color: #aaa; margin: 0 0 6px 0;">PRESTATION</p>
            <p style="font-size: 22px; font-weight: bold; margin: 0 0 4px 0;">${service}</p>
            <p style="font-size: 16px; color: #ccc; margin: 0;">${date} à ${time} · ${price}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <p style="font-size: 13px; color: #888; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.1em;">Client</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px; width: 40%;">Nom</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; font-weight: 600;">${clientNom}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;">${clientEmail}</td>
              </tr>
              ${clientTel ? `<tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Téléphone</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;">${clientTel}</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
            <p style="font-size: 13px; color: #888; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.1em;">Déplacement</p>
            ${deplacement
              ? `<p style="font-size: 14px; margin: 0;">📍 Tu te déplaces chez le client :<br><strong>${adresse}</strong></p>`
              : `<p style="font-size: 14px; margin: 0;">🏠 Le client se déplace chez toi.</p>`
            }
          </div>

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
