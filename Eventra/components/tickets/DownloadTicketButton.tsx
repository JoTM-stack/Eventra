'use client'

import jsPDF from 'jspdf'

interface Props {
  ticketCode: string
  eventName: string
  email: string
  amount: number
  status: string
}

export default function DownloadTicketButton({
  ticketCode,
  eventName,
  email,
  amount,
  status,
}: Props) {

 async function downloadTicket() {

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [180, 210],
  })

  //
  // COLORS
  //
  const purple: [number, number, number] = [111, 66, 193]

  //
  // BACKGROUND
  //
  doc.setFillColor(250, 250, 250)
  doc.rect(0, 0, 210, 148, 'F')

  //
  // TITLE
  //
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(...purple)

  doc.text('EVENTRA TICKET', 15, 28)

  //
  // LEFT DETAILS
  //
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)

  doc.setFont('helvetica', 'bold')
  doc.text('Event:', 18, 55)

  doc.setFont('helvetica', 'normal')
  doc.text(eventName, 61, 55)

  doc.setFont('helvetica', 'bold')
  doc.text('Ticket Holder:', 18, 70)

  doc.setFont('helvetica', 'normal')
  doc.text(email, 61, 70)

  doc.setFont('helvetica', 'bold')
  doc.text('Code:', 18, 85)

  doc.setFont('helvetica', 'normal')
  doc.text(ticketCode, 61, 85)

  doc.setFont('helvetica', 'bold')
  doc.text('Amount Paid:', 18, 100)

  doc.setFont('helvetica', 'normal')
  doc.text(`R${amount}`, 61, 100)

  doc.setFont('helvetica', 'bold')
  doc.text('Status:', 18, 115)

  doc.setFont('helvetica', 'normal')
  doc.text(status, 61, 115)

  //
  // DIVIDER
  //
  doc.setDrawColor(...purple)
  doc.setLineWidth(0.5)

  doc.line(120, 40, 120, 125)

  //
  // QR CODE
  //
  const qrData =
    `https://eventra.co.za/tickets/${ticketCode}`

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

  const qrBlob = await fetch(qrUrl).then(r => r.blob())

  const qrBase64 = await new Promise<string>((resolve) => {
    const reader = new FileReader()

    reader.onloadend = () =>
      resolve(reader.result as string)

    reader.readAsDataURL(qrBlob)
  })

  //
  // QR BORDER
  //
  doc.setDrawColor(...purple)

  doc.roundedRect(
    135,
    50,
    50,
    50,
    4,
    4
  )

  //
  // QR IMAGE
  //
  doc.addImage(
    qrBase64,
    'PNG',
    140,
    55,
    40,
    40
  )

//
// FOOTER LINE
//
    doc.setDrawColor(...purple)

    doc.line(10, 132, 200, 132)

//
// EVENTRA LOGO
//
    doc.setFont('helvetica', 'bold')

    doc.setFontSize(24)

    doc.setTextColor(...purple)

    doc.text('eventra', 18, 148)

//
// DIVIDER
//
    doc.setDrawColor(180, 180, 180)

    doc.line(55, 138, 55, 154)

//
// TAGLINE
//
    doc.setFont('helvetica', 'normal')

    doc.setFontSize(14)

    doc.setTextColor(40, 40, 40)

    doc.text(
          'YOUR EVENT. YOUR EXPERIENCE.',
          68,
          148
        )

  //
  // SAVE
  //
  doc.save(`${ticketCode}.pdf`)
}

  return (
    <button
      onClick={downloadTicket}
      className="
        rounded-2xl
        bg-white/5
        border border-white/10
        text-white
        py-4
        font-semibold
        w-full
      "
    >
      Download PDF
    </button>
  )
}
