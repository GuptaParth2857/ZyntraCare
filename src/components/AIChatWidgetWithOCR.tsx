'use client';

import { useState, useEffect, useRef } from 'react';
import * as TesseractJS from 'tesseract.js';

const AIChatWidgetWithOCR: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pipe, setPipe] = useState<any>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize model - removed for now due to compatibility issues
  useEffect(() => {
    // Placeholder for future AI implementation
    setModelLoading(false);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrError(null);
    setExtractedText('');

    try {
      const { data: { text } } = await TesseractJS.recognize(file, 'eng');
      setExtractedText(text || '');
      setOcrLoading(false);
    } catch (err) {
      console.error('OCR error:', err);
      setOcrError('Failed to extract text from image. Please try a clearer image.');
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInput = input.trim();
    const hasInput = userInput || extractedText.trim();
    if (!hasInput) return;

    // Prepare the user message: combine text input and extracted text if any
    let userMessage = '';
    if (userInput && extractedText.trim()) {
      userMessage = `${userInput}\n\nExtracted from report:\n${extractedText}`;
    } else if (userInput) {
      userMessage = userInput;
    } else {
      userMessage = `Extracted from report:\n${extractedText}`;
    }

    setInput('');
    setExtractedText(''); // Clear extracted text after use
    setLoading(true);

    // Add user message (show combined or just text)
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      // For now, provide a simple response since AI model is disabled
      const response = `Thank you for your message: "${userMessage}". Please note that the AI assistant feature is currently under development. For medical advice, please consult with a healthcare professional.`;
      
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('Generation error:', err);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error generating a response. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (modelError) {
    return (
      <div className="fixed bottom-4 right-4 w-80 bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800">AI Model Loading Failed</h3>
            <p className="text-sm text-red-700">{modelError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white/5 backdrop-blur-sm border border-gray-200/20 rounded-2xl shadow-xl p-4 z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">ZyntraCare Health Assistant</h3>
        <button onClick={() => setMessages([])} className="text-sm text-gray-400 hover:text-white">
          Clear
        </button>
      </div>

      {/* Model loading state */}
      {modelLoading && !pipe && (
        <div className="text-center text-gray-400 mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
          <p className="text-sm">Loading AI model...</p>
        </div>
      )}

      {/* Chat messages */}
      <div className="h-64 overflow-y-auto mb-4 pb-2">
        <div className="space-y-3">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500/20 text-white'
                    : 'bg-gray-100/20 text-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-xs px-3 py-2 rounded-lg bg-gray-100/20 text-gray-100">
                <p className="text-sm animate-pulse">Thinking...</p>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input and file upload */}
      <div className="flex space-x-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a health question..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300/20 bg-gray-50/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!pipe || loading}
        />
        <button
          type="button"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
        >
          Upload Report
        </button>
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* OCR status and extracted text preview */}
      {ocrLoading && (
        <div className="text-center text-blue-400 mb-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mb-1"></div>
          <p className="text-xs">Extracting text from report...</p>
        </div>
      )}
      {ocrError && (
        <div className="text-center text-red-400 mb-2">
          <p className="text-xs">{ocrError}</p>
        </div>
      )}
      {extractedText && (
        <div className="mb-2 p-2 bg-gray-50/20 rounded-lg text-xs text-gray-300">
          <strong className="text-gray-100">Extracted text:</strong> {extractedText.slice(0, 100)}{extractedText.length > 100 ? '...' : ''}
          <button
            onClick={() => setExtractedText('')}
            className="ml-2 text-xs text-blue-400 hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <button
          type="submit"
          disabled={(!input.trim() && !extractedText.trim()) || !pipe || loading}
          className="px-4 py-2 rounded-lg bg-blue-500/20 text-white hover:bg-blue-500/30 transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>

      {/* Disclaimer */}
      <div className="mt-4 text-xs text-gray-400 border-t border-gray-200/20 pt-3">
        <p className="whitespace-pre-wrap">
          ⚠️ Disclaimer: This AI provides general health information only. Not a substitute for professional medical advice. Always consult with a healthcare provider for medical decisions.
        </p>
      </div>
    </div>
  );
};

export default AIChatWidgetWithOCR;