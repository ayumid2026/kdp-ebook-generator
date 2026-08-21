const { GoogleGenerativeAI } = require('@google/generativeai');

// Initialize AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a structured outline
 */
async function generateOutline(topic, genre, targetWordCount) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `You are a professional KDP book author. Create a detailed chapter-by-chapter outline for a ${genre} ebook about: "${topic}".
Target total word count: approximately ${targetWordCount} words.

Return ONLY valid JSON in this exact format:
{
  "chapters": [
    { "title": "Chapter 1 Title", "outline": "2-3 bullet points describing key content" },
    { "title": "Chapter 2 Title", "outline": "2-3 bullet points" }
  ],
  "keyPoints": ["benefit 1", "benefit 2", "benefit 3", "benefit 4"]
}

Include 8-12 chapters. Make the outline specific, actionable, and compelling.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (error) {
        console.error('AI outline fallback:', error);
        return {
            chapters: [
                { title: 'Introduction', outline: 'Overview and what readers will learn' },
                { title: 'Getting Started', outline: 'First steps, tools, and mindset' },
                { title: 'Core Principles', outline: 'Fundamental concepts explained simply' },
                { title: 'Practical Application', outline: 'Real-world examples and case studies' },
                { title: 'Advanced Techniques', outline: 'Taking it to the next level' },
                { title: 'Common Pitfalls', outline: 'What to avoid and how to troubleshoot' },
                { title: 'Conclusion', outline: 'Summary and next steps' }
            ],
            keyPoints: ['Clear guidance', 'Actionable steps', 'Expert insights']
        };
    }
}

/**
 * Generate full text of a single chapter
 */
async function generateChapter(topic, chapterTitle, chapterOutline, wordCount) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Write a complete chapter for a KDP ebook.
Book Topic: ${topic}
Chapter Title: ${chapterTitle}
Chapter Outline: ${chapterOutline}
Target word count: approximately ${wordCount} words.

Write in a professional, engaging, and accessible tone. Use subheadings (###), short paragraphs, and bullet points.
Include practical examples or actionable tips.
The first paragraph after the chapter title should have NO indent.
Do not include any meta-commentary. Start directly with the content.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('AI chapter fallback:', error);
        return `# ${chapterTitle}\n\nThis chapter covers important aspects of ${topic}. ${chapterOutline}\n\n[Content automatically generated. Please refine.]`;
    }
}

/**
 * Generate Amazon KDP blurb with HTML
 */
async function generateBlurb(title, topic, genre, keyPoints) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Write a compelling Amazon KDP book description for:
Title: "${title}"
Topic: "${topic}"
Genre: ${genre}
Key selling points: ${keyPoints.join(', ')}

Requirements:
- Hook in the first 2 sentences
- 150–250 words
- Include HTML tags: <p>, <b>, <ul>, <li>
- End with a call-to-action
- Return ONLY the HTML description.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('AI blurb fallback:', error);
        return `<p><b>Discover the secrets of ${topic}</b></p>
<p>This comprehensive guide will transform your understanding.</p>
<ul>
<li>✅ Proven strategies</li>
<li>✅ Step-by-step instructions</li>
<li>✅ Expert insights</li>
</ul>
<p>Scroll up and click "Buy Now" to start your journey!</p>`;
    }
}

module.exports = { generateOutline, generateChapter, generateBlurb };
