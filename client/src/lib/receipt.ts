/**
 * Receipt Printing Utility
 * สร้างใบเสร็จอย่างง่ายสำหรับพิมพ์
 */

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface ReceiptData {
  shopName: string;
  date: string;
  time: string;
  items: ReceiptItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'transfer' | 'credit';
  customerName?: string;
  notes?: string;
  receiptFooter?: string;
}

export function generateReceiptHTML(data: ReceiptData): string {
  const paymentMethodLabel = {
    cash: 'เงินสด',
    transfer: 'โอนเงิน',
    credit: 'ขายเชื่อ'
  };

  const itemsHTML = data.items
    .map(
      item => `
    <tr>
      <td style="text-align: left; padding: 8px 0;">${item.name}</td>
      <td style="text-align: center; padding: 8px 0;">${item.quantity} ${item.unit}</td>
      <td style="text-align: right; padding: 8px 0;">${item.price.toLocaleString()}</td>
      <td style="text-align: right; padding: 8px 0;">${item.total.toLocaleString()}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ใบเสร็จ</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Noto Sans Thai', Arial, sans-serif;
          background: white;
          padding: 0;
          margin: 0;
        }
        
        .receipt {
          width: 80mm;
          margin: 0 auto;
          padding: 10mm;
          background: white;
          font-size: 12px;
          line-height: 1.6;
        }
        
        .header {
          text-align: center;
          margin-bottom: 15px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        
        .shop-name {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        
        .receipt-title {
          font-size: 14px;
          font-weight: bold;
          color: #666;
          margin-bottom: 10px;
        }
        
        .date-time {
          font-size: 11px;
          color: #666;
          margin-bottom: 3px;
        }
        
        .customer-info {
          font-size: 11px;
          color: #666;
          margin-bottom: 10px;
        }
        
        .items-section {
          margin-bottom: 15px;
        }
        
        .items-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 5px;
          font-weight: bold;
          font-size: 11px;
          border-bottom: 1px solid #999;
          padding-bottom: 5px;
          margin-bottom: 5px;
        }
        
        .items-header div {
          text-align: left;
        }
        
        .items-header div:nth-child(2),
        .items-header div:nth-child(3),
        .items-header div:nth-child(4) {
          text-align: right;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        
        table td {
          padding: 6px 0;
          font-size: 11px;
          border: none;
        }
        
        table td:first-child {
          text-align: left;
        }
        
        table td:nth-child(2),
        table td:nth-child(3),
        table td:nth-child(4) {
          text-align: right;
        }
        
        .summary {
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
          padding: 10px 0;
          margin-bottom: 10px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        
        .payment-method {
          font-size: 11px;
          color: #666;
          text-align: center;
          margin-top: 5px;
        }
        
        .notes {
          font-size: 10px;
          color: #999;
          text-align: center;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed #ccc;
        }
        
        .footer {
          text-align: center;
          font-size: 10px;
          color: #999;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px dashed #ccc;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .receipt {
            width: 80mm;
            margin: 0;
            padding: 10mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="shop-name">${data.shopName}</div>
          <div class="receipt-title">ใบเสร็จ</div>
          <div class="date-time">${data.date} เวลา ${data.time}</div>
        </div>
        
        ${
          data.customerName
            ? `<div class="customer-info">ลูกค้า: ${data.customerName}</div>`
            : ''
        }
        
        <div class="items-section">
          <div class="items-header">
            <div>สินค้า</div>
            <div>จำนวน</div>
            <div>ราคา</div>
            <div>รวม</div>
          </div>
          
          <table>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>
        
        <div class="summary">
          <div class="total-row">
            <span>รวมทั้งสิ้น</span>
            <span>${data.totalAmount.toLocaleString()} บาท</span>
          </div>
          <div class="payment-method">
            วิธีชำระ: ${paymentMethodLabel[data.paymentMethod]}
          </div>
        </div>
        
        ${
          data.notes
            ? `<div class="notes">หมายเหตุ: ${data.notes}</div>`
            : ''
        }
        
        ${data.receiptFooter ? `<div class="footer">${data.receiptFooter}</div>` : '<div class="footer">ขอบคุณที่ใช้บริการ</div>'}
      </div>
    </body>
    </html>
  `;
}

export function printReceipt(data: ReceiptData): void {
  const html = generateReceiptHTML(data);
  const printWindow = window.open('', '', 'width=800,height=600');

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  }
}

export function downloadReceiptPDF(data: ReceiptData): void {
  // This would require a PDF library like jsPDF
  // For now, we'll just trigger the print dialog
  printReceipt(data);
}
