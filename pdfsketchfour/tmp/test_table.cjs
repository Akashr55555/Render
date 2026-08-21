const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const cheerio = require('cheerio');
const fs = require('fs');

function safeWinAnsiText(str, font) {
  if (!str) return '';
  let sanitized = str
    .replace(/[\u2018\u2019]/g, '\'')
    .replace(/[\u201C\u201D]/g, '\"')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '--')
    .replace(/\u2026/g, '...')
    .replace(/[\u2022\u25CF\u25CB\u25A0]/g, '•')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  let result = '';
  for (const char of sanitized) {
    if (char === '\n' || char === '\t') {
      result += char;
      continue;
    }
    try {
      font.encodeText(char);
      result += char;
    } catch (_) {
      result += ' ';
    }
  }
  return result;
}

(async () => {
  const html = '<p>Document Overview</p><table><tr><th>ID</th><th>Service Description</th><th>Category</th><th>Price</th></tr><tr><td>101</td><td>Word to PDF Conversion Engine with table support</td><td>Converter</td><td>$29.99</td></tr><tr><td>102</td><td>Cloud document synchronization module</td><td>Backend</td><td>$49.00</td></tr></table><p>End of document table test.</p>';

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595.28, 841.89]);
  let y = 800;

  const $ = cheerio.load(html);

  $('body > *').each((i, el) => {
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3') {
      const text = safeWinAnsiText($(el).text().trim(), font);
      page.drawText(text, { x: 50, y, size: tag === 'p' ? 10 : 14, font: tag === 'p' ? font : fontBold });
      y -= 20;
    } else if (tag === 'table') {
      const rows = [];
      $(el).find('tr').each((rIdx, tr) => {
        const cells = [];
        $(tr).find('td, th').each((cIdx, td) => {
          const isHeader = td.tagName.toLowerCase() === 'th' || rIdx === 0;
          cells.push({ text: safeWinAnsiText($(td).text().trim(), isHeader ? fontBold : font), isHeader });
        });
        if (cells.length > 0) rows.push(cells);
      });

      if (rows.length > 0) {
        const numCols = Math.max(...rows.map(r => r.length));
        const tableWidth = 495;
        const colWidth = tableWidth / numCols;

        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const row = rows[rIdx];
          const wrappedCells = row.map(cell => {
            const words = cell.text.split(/\s+/);
            const lines = [];
            let cur = '';
            for (const w of words) {
              if (!w) continue;
              const test = cur ? `${cur} ${w}` : w;
              const wWidth = (cell.isHeader ? fontBold : font).widthOfTextAtSize(test, 9);
              if (wWidth > colWidth - 10 && cur) {
                lines.push(cur);
                cur = w;
              } else {
                cur = test;
              }
            }
            if (cur) lines.push(cur);
            return { lines, isHeader: cell.isHeader };
          });

          const maxLines = Math.max(1, ...wrappedCells.map(c => c.lines.length));
          const rowHeight = maxLines * 12 + 10;

          if (y - rowHeight < 50) {
            page = pdfDoc.addPage([595.28, 841.89]);
            y = 800;
          }

          if (rIdx === 0) {
            page.drawRectangle({
              x: 50,
              y: y - rowHeight,
              width: tableWidth,
              height: rowHeight,
              color: rgb(0.9, 0.93, 0.96),
            });
          }

          for (let cIdx = 0; cIdx < numCols; cIdx++) {
            const cell = wrappedCells[cIdx] || { lines: [''], isHeader: false };
            const cellX = 50 + cIdx * colWidth;
            const f = cell.isHeader ? fontBold : font;

            let textY = y - 14;
            for (const line of cell.lines) {
              page.drawText(line, { x: cellX + 5, y: textY, size: 9, font: f, color: rgb(0.1, 0.1, 0.1) });
              textY -= 12;
            }

            page.drawRectangle({
              x: cellX,
              y: y - rowHeight,
              width: colWidth,
              height: rowHeight,
              borderColor: rgb(0.75, 0.75, 0.75),
              borderWidth: 0.75,
            });
          }

          y -= rowHeight;
        }
        y -= 15;
      }
    }
  });

  const bytes = await pdfDoc.save();
  fs.writeFileSync('/tmp/test_table_pdf.pdf', bytes);
  console.log('Generated PDF with table! Size:', bytes.length);
})();
