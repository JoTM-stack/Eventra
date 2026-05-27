import { Resend } from 'resend'

const resend = new Resend(
  process.env.RESEND_API_KEY
)

interface Props {
  to: string
  eventName: string
  ticketCode: string
  pdfBuffer: Buffer
}

export async function sendTicketEmail({
  to,
  eventName,
  ticketCode,
  pdfBuffer,
}: Props) {

  await resend.emails.send({

    from:
      'Eventra <onboarding@resend.dev>',

    to,

    subject:
      `Your Ticket for ${eventName}`,

    html: `
      <h1>Payment Successful</h1>

      <p>
        Your ticket for
        <strong>${eventName}</strong>
        is attached.
      </p>

      <p>
        Ticket Code:
        <strong>${ticketCode}</strong>
      </p>
    `,

    attachments: [
      {
        filename:
          `${ticketCode}.pdf`,

        content:
          pdfBuffer,
      },
    ],
  })
}