import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [topic, setTopic] = useState('');
    const [genre, setGenre] = useState('Non-Fiction');
    const [wordCount, setWordCount] = useState(20000);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [loading, setLoading] = useState(false);
    const [ebookData, setEbookData] = useState(null);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            alert('Please enter a topic.');
            return;
        }
        setLoading(true);
        setEbookData(null);
        try {
            const response = await axios.post('/api/ebook/generate-full-ebook', {
                topic: topic.trim(),
                genre,
                wordCount: Number(wordCount),
                title: title.trim() || topic.trim(),
                author: author.trim() || 'Your Name'
            });
            if (response.data.success) {
                setEbookData(response.data);
            } else {
                alert('Error: ' + response.data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to generate ebook. Please check console.');
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = (base64, mimeType, fileName) => {
        const byteChars = atob(base64);
        const byteArray = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
            byteArray[i] = byteChars.charCodeAt(i);
        }
        const blob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">📚 KDP Ebook Generator</h1>
                    <p className="text-gray-600 mt-1">AI-powered creation for Amazon Kindle Direct Publishing</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Panel */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold mb-5 text-gray-800">📝 Ebook Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Topic *</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Vegan Meal Prep for Beginners"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Genre</label>
                                <select
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                                    disabled={loading}
                                >
                                    <option>Non-Fiction</option>
                                    <option>Romance</option>
                                    <option>Thriller</option>
                                    <option>Fantasy</option>
                                    <option>Sci-Fi</option>
                                    <option>Self-Help</option>
                                    <option>Business</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Word Count</label>
                                <input
                                    type="number"
                                    value={wordCount}
                                    onChange={(e) => setWordCount(parseInt(e.target.value) || 20000)}
                                    min={5000}
                                    max={100000}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Book Title (optional)</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Leave blank to auto-generate"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Author Name</label>
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder="Your name or pen name"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                                    disabled={loading}
                                />
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !topic.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : '🚀 Generate Ebook'}
                            </button>
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold mb-5 text-gray-800">📖 Generated Ebook</h2>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                                <p className="mt-4 text-gray-500">AI is writing your ebook... 30-60 seconds.</p>
                            </div>
                        ) : ebookData ? (
                            <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
                                {ebookData.cover && (
                                    <div>
                                        <h3 className="font-medium text-gray-700">📸 Cover Preview</h3>
                                        <img
                                            src={`data:image/jpeg;base64,${ebookData.cover}`}
                                            alt="Book Cover"
                                            className="mt-2 max-h-48 rounded shadow border border-gray-200 object-contain"
                                        />
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="font-medium text-gray-700">📄 Book Description</h3>
                                    <div
                                        className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: ebookData.blurb }}
                                    />
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="font-medium text-gray-700">📑 Outline</h3>
                                    <ul className="mt-2 list-disc list-inside text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                                        {ebookData.outline?.chapters?.map((ch, i) => (
                                            <li key={i} className="py-0.5">
                                                <span className="font-medium">{ch.title}</span>
                                                {ch.outline && <span className="text-gray-500 text-xs block ml-5">— {ch.outline}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-3">
                                    {ebookData.pdf && (
                                        <button
                                            onClick={() => downloadFile(ebookData.pdf, 'application/pdf', `${ebookData.outline?.title || 'ebook'}.pdf`)}
                                            className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded transition"
                                        >
                                            ⬇️ Download PDF
                                        </button>
                                    )}
                                    {ebookData.epub && (
                                        <button
                                            onClick={() => downloadFile(ebookData.epub, 'application/epub+zip', `${ebookData.outline?.title || 'ebook'}.epub`)}
                                            className="flex-1 min-w-[120px] bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded transition"
                                        >
                                            ⬇️ Download EPUB
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 pt-2">PDF = print-ready (6"x9"). EPUB = Kindle-compatible.</p>
                            </div>
                        ) : (
                            <div className="text-gray-400 text-center py-20">
                                <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <p className="mt-4 text-base">Enter details and click <strong>Generate</strong></p>
                                <p className="text-sm mt-1">AI creates cover, blurb, outline, PDF & EPUB.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
