'use client';

import { useState, useEffect, useRef } from 'react';
import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
// @ts-ignore
env.backends = ['wasm']; // Use WASM backend for browser

const AIChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pipe, setPipe] = useState<any>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setModelLoading(true);
        setModelError(null);
        // Using a small, fast model suitable for health Q&A
        const loadedPipe = await pipeline('text-generation', 'TinyLlama/TinyLlama-1.1B-Chat-v1.0', {
          // Quantized version for smaller size and faster inference
          // The model will be downloaded and cached in browser
          progress_callback: (progress: number) => {
            console.log(`Model loading progress: ${progress}%`);
          },
        });
        setPipe(loadedPipe);
        setModelLoading(false);
      } catch (err) {
        console.error('Failed to load model:', err);
        setModelError('Failed to load AI model. Please check console for details.');
        setModelLoading(false);
      }
    };

    loadModel();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !pipe) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Create a health-focused prompt
      const prompt = `You are a helpful healthcare assistant. Provide accurate, helpful, and concise health information. Always remind users to consult with healthcare professionals for medical advice. User question: "${userMessage}"`;

      const result = await pipe(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.1,
      });

      const generatedText = result[0].generated_text;
      // Extract the assistant's response (remove the prompt)
      const response = generatedText.replace(prompt, '').trim();

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

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a health question..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300/20 bg-gray-50/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!pipe || loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || !pipe || loading}
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

export default AIChatWidget;