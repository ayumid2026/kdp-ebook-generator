const express = require('express');
const router = express.Router();
const { generateOutline, generateChapter, generateBlurb } = require('../services/aiService');
const { generatePDF, generateEPUB } = require('../services/formattingService');
const { generateCover } = require('../services/coverService');

// Generate only the outline
router.post('/generate-outline', async (req, res) => {
    try {
        const { topic, genre, wordCount } = req.body;
        if (!topic) return res.status(400).json({ success: false, error: 'Topic is required' });
        const outline = await generateOutline(topic, genre, wordCount || 20000);
        res.json({ success: true, outline });
    } catch (error) {
        console.error('Outline error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate a single chapter
router.post('/generate-chapter', async (req, res) => {
    try {
        const { topic, chapterTitle, chapterOutline, wordCount } = req.body;
        if (!topic || !chapterTitle) {
            return res.status(400).json({ success: false, error: 'Topic and chapter title are required' });
        }
        const content = await generateChapter(topic, chapterTitle, chapterOutline || '', wordCount || 1500);
        res.json({ success: true, content });
    } catch (error) {
        console.error('Chapter error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate a complete ebook (all-in-one)
router.post('/generate-full-ebook', async (req, res) => {
    try {
        const { topic, genre, wordCount, title, author } = req.body;
        if (!topic) return res.status(400).json({ success: false, error: 'Topic is required' });

        const finalTitle = title || topic;
        const finalAuthor = author || 'Your Name';
        const targetWordCount = wordCount || 20000;
        const genreType = genre || 'Non-Fiction';

        console.log(`📚 Generating ebook: "${finalTitle}" by ${finalAuthor} (${targetWordCount} words)`);

        // Step 1: Generate outline
        const outline = await generateOutline(topic, genreType, targetWordCount);
        const chaptersOutline = outline.chapters || [];

        // Step 2: Generate all chapters
        const chapters = [];
        const wordsPerChapter = Math.floor(targetWordCount / Math.max(chaptersOutline.length, 1));
        for (const ch of chaptersOutline) {
            const content = await generateChapter(
                topic,
                ch.title,
                ch.outline || '',
                Math.min(wordsPerChapter, 3000)
            );
            chapters.push({ title: ch.title, body: content });
        }

        // Fallback if no chapters generated
        if (chapters.length === 0) {
            const fallback = await generateChapter(topic, 'Introduction', 'Overview', targetWordCount);
            chapters.push({ title: 'Introduction', body: fallback });
        }

        // Step 3: Generate blurb
        const keyPoints = outline.keyPoints || ['Practical advice', 'Step-by-step guidance', 'Expert insights'];
        const blurb = await generateBlurb(finalTitle, topic, genreType, keyPoints);

        // Step 4: Generate cover (synthetic, no external API key required)
        const coverBuffer = await generateCover(finalTitle, finalAuthor, genreType);
        const coverBase64 = coverBuffer.toString('base64');

        // Step 5: Generate PDF and EPUB
        const metadata = { title: finalTitle, author: finalAuthor, publisher: 'Self-Published' };
        const pdfBuffer = await generatePDF(chapters, metadata);
        const epubBuffer = await generateEPUB(chapters, metadata, coverBuffer);

        res.json({
            success: true,
            outline,
            blurb,
            chapters,
            cover: coverBase64,
            pdf: pdfBuffer.toString('base64'),
            epub: epubBuffer.toString('base64')
        });
    } catch (error) {
        console.error('Full ebook error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
