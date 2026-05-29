import pdfMake from 'pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Bill } from '../../../types/bill';
import { InvoiceTemplate } from '../core';

// Initialize fonts (Handle the vfs correctly for 0.3)
if (pdfFonts && (pdfFonts as any).pdfMake) {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
}

/**
 * Generate PDF using pdfmake 0.3 standards
 */
export const generateInvoicePDF = async (bill: Bill, template: InvoiceTemplate) => {
  const size = template.settings.billSize || 'A4';
  
  // Page setup based on size
  let pageSize: any = 'A4';
  let pageMargins: [number, number, number, number] = [40, 40, 40, 40];
  
  if (size === 'A5') pageSize = 'A5';
  else if (size === '80mm') {
    pageSize = { width: 226, height: 841 }; // 80mm wide, arbitrary height
    pageMargins = [10, 10, 10, 10];
  } else if (size === '58mm') {
    pageSize = { width: 164, height: 841 }; // 58mm wide
    pageMargins = [5, 5, 5, 5];
  }

  const docDefinition: any = {
    pageSize: pageSize,
    pageMargins: pageMargins,
    content: [
      // HEADER
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: bill.user?.companyName || 'BUSINESS NAME', style: 'header' },
              { text: bill.user?.address || '', style: 'subheader' },
              { text: `Phone: ${bill.user?.phone || ''}`, style: 'contact' },
              { text: `GSTIN: ${bill.user?.gstNumber || ''}`, style: 'contact' },
            ]
          },
          {
            width: 'auto',
            stack: [
              { text: template.name.toUpperCase(), style: 'invoiceTitle', alignment: 'right' },
              {
                table: {
                  widths: ['auto', 'auto'],
                  body: [
                    [{ text: 'Invoice No:', bold: true }, bill.billNumber || 'NEW'],
                    [{ text: 'Date:', bold: true }, bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : ''],
                  ]
                },
                layout: 'noBorders',
                alignment: 'right'
              }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },

      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#eeeeee' }], margin: [0, 0, 0, 20] },

      // CUSTOMER INFO
      {
        text: 'BILL TO:',
        style: 'sectionTitle'
      },
      {
        stack: [
          { text: bill.customerName, bold: true, fontSize: 12 },
          { text: bill.customerEmail || '', fontSize: 10 },
          { text: bill.customer?.address || '', fontSize: 10 },
        ],
        margin: [0, 5, 0, 20]
      },

      // ITEMS TABLE
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'S.No', style: 'tableHeader' },
              { text: 'Item Description', style: 'tableHeader' },
              { text: 'Qty', style: 'tableHeader', alignment: 'center' },
              { text: 'Rate', style: 'tableHeader', alignment: 'right' },
              { text: 'Amount', style: 'tableHeader', alignment: 'right' },
            ],
            ...bill.items.map((item, index) => [
              { text: (index + 1).toString(), alignment: 'center' },
              { text: item.productName },
              { text: item.quantity.toString(), alignment: 'center' },
              { text: item.price.toFixed(2), alignment: 'right' },
              { text: item.total.toFixed(2), alignment: 'right' },
            ])
          ]
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
          vLineWidth: () => 0,
          hLineColor: (i: number) => (i === 0 || i === 1) ? '#333333' : '#eeeeee',
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        }
      },

      // TOTALS
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 180,
            margin: [0, 20, 0, 0],
            table: {
              widths: ['*', 'auto'],
              body: [
                [{ text: 'Subtotal' }, { text: bill.subtotal.toFixed(2), alignment: 'right' }],
                [{ text: 'Tax Amount' }, { text: bill.taxAmount.toFixed(2), alignment: 'right' }],
                [
                  { text: 'Grand Total', bold: true, fontSize: 14, color: '#3b82f6' },
                  { text: bill.totalAmount.toFixed(2), bold: true, fontSize: 14, color: '#3b82f6', alignment: 'right' }
                ],
              ]
            },
            layout: 'noBorders'
          }
        ]
      },

      // PAYMENT INFO
      {
        stack: [
          { text: 'PAYMENT DETAILS', style: 'sectionTitle', margin: [0, 40, 0, 5] },
          { text: `Mode: ${bill.paymentMode || 'N/A'}`, fontSize: 10 },
          { text: `Bank: ${bill.user?.bankName || ''}`, fontSize: 10 },
          { text: `A/C: ${bill.user?.accountNumber || ''}`, fontSize: 10 },
          { text: `IFSC: ${bill.user?.ifscCode || ''}`, fontSize: 10 },
          { text: `UPI: ${bill.user?.upiId || ''}`, fontSize: 10, color: '#3b82f6' },
        ]
      },

      // FOOTER
      {
        stack: [
          { text: 'Terms & Conditions:', bold: true, margin: [0, 30, 0, 5] },
          { text: '1. Goods once sold will not be taken back.', fontSize: 8, color: '#666666' },
          { text: '2. This is a computer generated invoice.', fontSize: 8, color: '#666666' },
        ],
        alignment: 'center',
        margin: [0, 40, 0, 0]
      }
    ],
    styles: {
      header: { fontSize: 20, bold: true, color: '#1e293b' },
      subheader: { fontSize: 10, color: '#64748b', margin: [0, 2, 0, 2] },
      contact: { fontSize: 9, color: '#64748b' },
      invoiceTitle: { fontSize: 24, bold: true, color: '#3b82f6', margin: [0, 0, 0, 10] },
      sectionTitle: { fontSize: 10, bold: true, color: '#64748b', margin: [0, 10, 0, 5], decoration: 'underline' },
      tableHeader: { bold: true, fontSize: 11, color: '#ffffff', fillColor: '#334155', margin: [0, 4, 0, 4] }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };

  pdfMake.createPdf(docDefinition).download(`Invoice_${bill.billNumber || 'NEW'}.pdf`);
};
