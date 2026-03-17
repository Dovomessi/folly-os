import { Resend } from 'resend'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const fromEmail = process.env.RESEND_FROM_EMAIL || 'rdv@lexanova.fr'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

interface BookingEmailData {
  guestName: string
  guestEmail: string
  eventTitle: string
  date: Date
  startTime: string
  endTime: string
  hostName: string
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  const resend = getResend()
  if (!resend) return

  const dateFormatted = format(data.date, 'EEEE d MMMM yyyy', { locale: fr })

  // Email to guest
  await resend.emails.send({
    from: fromEmail,
    to: data.guestEmail,
    subject: `Confirmation : ${data.eventTitle} le ${dateFormatted}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Votre rendez-vous est confirme</h2>
        <p>Bonjour ${data.guestName},</p>
        <p>Votre rendez-vous avec <strong>${data.hostName}</strong> est confirme :</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>${data.eventTitle}</strong></p>
          <p style="margin: 4px 0;">${dateFormatted}</p>
          <p style="margin: 4px 0;">${data.startTime} - ${data.endTime}</p>
        </div>
        <p>A bientot !</p>
      </div>
    `,
  })
}

export async function sendBookingNotification(data: BookingEmailData, hostEmail: string) {
  const resend = getResend()
  if (!resend) return

  const dateFormatted = format(data.date, 'EEEE d MMMM yyyy', { locale: fr })

  // Email to host
  await resend.emails.send({
    from: fromEmail,
    to: hostEmail,
    subject: `Nouveau RDV : ${data.guestName} - ${data.eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Nouveau rendez-vous reserve</h2>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>${data.eventTitle}</strong></p>
          <p style="margin: 4px 0;">${dateFormatted}</p>
          <p style="margin: 4px 0;">${data.startTime} - ${data.endTime}</p>
          <p style="margin: 4px 0;">Client : ${data.guestName} (${data.guestEmail})</p>
        </div>
      </div>
    `,
  })
}
