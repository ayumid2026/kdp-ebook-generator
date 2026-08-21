const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const Epub = require('epub-gen');

/**
 * Wrap text to fit within a given width
 */
function wrapText(text, maxWidth, font, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width <= maxWidth) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

/**
 * Generate KDP-compliant PDF (6" x 9" trim size)
 */
async function generatePDF(chapters, metadata) {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const pageWidth = 432;   // 6 inches at 72 DPI
    const pageHeight = 648;  // 9 inches
    const margin = 54;       // 0.75 inch
    const maxTextWidth = pageWidth - margin * 2;
    const fontSize = 11;
    const lineHeight = 14;

    // --- Title Page ---
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    page.drawText(metadata.title, {
        x: margin,
        y: y,
        size: 24,
        font: boldFont,
        color: rgb(0, 0, 0),
    });
    y -= 40;
    page.drawText(`By ${metadata.author}`, {
        x: margin,
        y: y,
        size: 16,
        font: font,
        color: rgb(0, 0, 0),
    });
    y -= 60;
    page.drawText(metadata.publisher || 'Self-Published', {
        x: margin,
        y: y,
        size: 12,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
    });

    // --- Copyright Page ---
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
    page.drawText(`Copyright © ${new Date().getFullYear()} ${metadata.author}`, {
        x: margin,
        y: y,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
    });
    y -= 20;
    page.drawText('All rights reserved. No part of this book may be reproduced...', {
        x: margin,
        y: y,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
    });

    // --- Chapters ---
    for (const chapter of chapters) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;

        // Chapter title (centered)
        const titleWidth = boldFont.widthOfTextAtSize(chapter.title, 18);
        const titleX = (pageWidth - titleWidth) / 2;
        page.drawText(chapter.title, {
            x: titleX,
            y: y,
            size: 18,
            font: boldFont,
            color: rgb(0, 0, 0),
        });
        y -= 40;

        // Body text
        const plainText = chapter.body.replace(/#+\s/g, '').replace(/\*\*/g, '');
        const paragraphs = plainText.split('\n').filter(p => p.trim().length > 0);
        let firstParagraph = true;

        for (const para of paragraphs) {
            const indent = firstParagraph ? 0 : 20;
            firstParagraph = false;
            const lines = wrapText(para, maxTextWidth - indent, font, fontSize);
            for (const line of lines) {
                if (y - lineHeight < margin) {
                    page = pdfDoc.addPage([pageWidth, pageHeight]);
                    y = pageHeight - margin;
                }
                page.drawText(line, {
                    x: margin + indent,
                    y: y,
                    size: fontSize,
                    font: font,
                    color: rgb(0, 0, 0),
                });
                y -= lineHeight;
            }
            y -= 4;
        }
    }

    return await pdfDoc.save();
}

/**
 * Generate EPUB (Kindle-compatible)
 */
async function generateEPUB(chapters, metadata, coverBuffer) {
    const content = chapters.map(ch => ({
        title: ch.title,
        data: ch.body.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('')
    }));

    const options = {
        title: metadata.title,
        author: metadata.author,
        publisher: metadata.publisher || 'Self-Published',
        cover: coverBuffer || undefined,
        content: content,
        lang: 'en',
        tocTitle: 'Table of Contents',
        version: 3,
        output: 'buffer'
    };

    try {
        const epub = new Epub(options);
        return await epub.promise;
    } catch (error) {
        console.error('EPUB fallback:', error);
        return Buffer.from([]);
    }
}

module.exports = { generatePDF, generateEPUB };
