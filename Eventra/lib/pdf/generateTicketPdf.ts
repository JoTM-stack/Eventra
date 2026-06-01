import jsPDF from 'jspdf'
import QRCode from 'qrcode'

interface Props {
  ticketCode: string
  eventName: string
  email: string
  amount: number
  status: string
}

export async function generateTicketPdf({
  ticketCode,
  eventName,
  email,
  amount,
  status,
}: Props) {

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [180, 210],
  })

  const purple: [number, number, number] = [111, 66, 193]

  doc.setFillColor(250, 250, 250)
  doc.rect(0, 0, 210, 148, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(...purple)

  doc.text('EVENTRA TICKET', 15, 28)

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)

  doc.setFont('helvetica', 'bold')
  doc.text('Event:', 18, 55)

  doc.setFont('helvetica', 'normal')
  doc.text(eventName || 'Event', 61, 55)

  doc.setFont('helvetica', 'bold')
  doc.text('Ticket Holder:', 18, 70)

  doc.setFont('helvetica', 'normal')
  doc.text(email  || 'No email', 61, 70)

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

  doc.setDrawColor(...purple)
  doc.setLineWidth(0.5)

  doc.line(120, 40, 120, 125)

  //
  // LOCAL QR GENERATION
  //
  const qrData =
    `https://eventra.co.za/tickets/${ticketCode}`

  const qrBase64 =
    await QRCode.toDataURL(qrData)

  doc.roundedRect(
    135,
    50,
    50,
    50,
    4,
    4
  )

  doc.addImage(
    qrBase64,
    'PNG',
    140,
    55,
    40,
    40
  )

  doc.line(10, 132, 200, 132)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(...purple)

  doc.text('eventra', 18, 148)

  doc.line(55, 138, 55, 154)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)

  doc.text(
    'YOUR EVENT. YOUR EXPERIENCE.',
    68,
    148
  )

  return Buffer.from(
    doc.output('arraybuffer')
  )
}
