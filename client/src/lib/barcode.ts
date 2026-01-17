import JsBarcode from 'jsbarcode';

export interface BarcodeItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
}

export function generateBarcode(value: string): string {
  const canvas = document.createElement('canvas');
  try {
    JsBarcode(canvas, value, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: false,
      margin: 5
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating barcode:', error);
    return '';
  }
}

export function printBarcodes(items: BarcodeItem[], itemsPerPage: number = 6) {
  const printWindow = window.open('', '', 'width=800,height=600');
  if (!printWindow) {
    alert('ไม่สามารถเปิดหน้าต่างพิมพ์ได้');
    return;
  }

  let html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>พิมพ์บาร์โค้ด</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Noto Sans Thai', sans-serif;
          background: white;
          padding: 10mm;
        }
        .page {
          page-break-after: always;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15mm;
          margin-bottom: 20mm;
        }
        .barcode-item {
          border: 1px solid #ddd;
          padding: 10mm;
          text-align: center;
          page-break-inside: avoid;
          background: white;
        }
        .barcode-item img {
          max-width: 100%;
          height: auto;
          margin: 5mm 0;
        }
        .barcode-item .name {
          font-size: 11pt;
          font-weight: bold;
          margin: 5mm 0;
          word-wrap: break-word;
          min-height: 30px;
        }
        .barcode-item .sku {
          font-size: 9pt;
          color: #666;
          margin: 3mm 0;
        }
        .barcode-item .price {
          font-size: 12pt;
          font-weight: bold;
          color: #003D99;
          margin: 5mm 0;
        }
        .barcode-item .unit {
          font-size: 9pt;
          color: #999;
        }
        @media print {
          body {
            padding: 0;
          }
          .page {
            margin-bottom: 0;
          }
        }
      </style>
    </head>
    <body>
  `;

  // Group items into pages
  for (let i = 0; i < items.length; i += itemsPerPage) {
    html += '<div class="page">';
    const pageItems = items.slice(i, i + itemsPerPage);
    
    pageItems.forEach((item) => {
      const barcodeImage = generateBarcode(item.sku);
      html += `
        <div class="barcode-item">
          <div class="name">${item.name}</div>
          <div class="sku">SKU: ${item.sku}</div>
          ${barcodeImage ? `<img src="${barcodeImage}" alt="barcode">` : '<div style="height: 50px; display: flex; align-items: center; justify-content: center; color: #ccc;">ไม่สามารถสร้างบาร์โค้ด</div>'}
          <div class="price">${item.price.toLocaleString()} บาท</div>
          <div class="unit">${item.unit}</div>
        </div>
      `;
    });

    // Fill remaining slots with empty boxes
    const remainingSlots = itemsPerPage - pageItems.length;
    for (let j = 0; j < remainingSlots; j++) {
      html += '<div class="barcode-item" style="visibility: hidden;"></div>';
    }

    html += '</div>';
  }

  html += `
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for images to load before printing
  setTimeout(() => {
    printWindow.print();
  }, 1000);
}

export function printSingleBarcode(item: BarcodeItem) {
  const printWindow = window.open('', '', 'width=400,height=300');
  if (!printWindow) {
    alert('ไม่สามารถเปิดหน้าต่างพิมพ์ได้');
    return;
  }

  const barcodeImage = generateBarcode(item.sku);
  
  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>พิมพ์บาร์โค้ด - ${item.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Noto Sans Thai', sans-serif;
          background: white;
          padding: 10mm;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .barcode-container {
          border: 2px solid #003D99;
          padding: 15mm;
          text-align: center;
          background: white;
          width: 80mm;
        }
        .barcode-container .name {
          font-size: 13pt;
          font-weight: bold;
          margin-bottom: 8mm;
          word-wrap: break-word;
        }
        .barcode-container img {
          max-width: 100%;
          height: auto;
          margin: 8mm 0;
        }
        .barcode-container .sku {
          font-size: 10pt;
          color: #666;
          margin: 5mm 0;
        }
        .barcode-container .price {
          font-size: 14pt;
          font-weight: bold;
          color: #003D99;
          margin: 8mm 0;
        }
        .barcode-container .unit {
          font-size: 10pt;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="barcode-container">
        <div class="name">${item.name}</div>
        <div class="sku">SKU: ${item.sku}</div>
        ${barcodeImage ? `<img src="${barcodeImage}" alt="barcode">` : '<div style="height: 50px; display: flex; align-items: center; justify-content: center; color: #ccc;">ไม่สามารถสร้างบาร์โค้ด</div>'}
        <div class="price">${item.price.toLocaleString()} บาท</div>
        <div class="unit">${item.unit}</div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
  }, 1000);
}
