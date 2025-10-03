import React, { useState, useCallback } from 'react';
import { generateStudioVibeImage } from '../services/geminiService';
import Button from './common/Button';
import Spinner from './common/Spinner';

const VibeGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('Cozy rainy night, vintage synths, neon lights');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a vibe description.');
      return;
    }
    setIsLoading(true);
    setError('');
    setImageUrl('');
    try {
      const result = await generateStudioVibeImage(prompt);
      setImageUrl(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    const sanitizedPrompt = prompt.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').slice(0, 30);
    link.download = `producer-oasis-${sanitizedPrompt || 'vibe'}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl, prompt]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-center mb-2">Studio Vibe Generator</h2>
      <p className="text-gray-400 text-center mb-6">Describe your ideal studio mood and let AI create it.</p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col sm:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., minimalist, sunset, analog gear"
          className="w-full flex-grow bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'Creating...' : 'Generate Vibe'}
        </Button>
      </form>
      
      {isLoading && <Spinner />}
      {error && <p className="text-red-400 mt-4">{error}</p>}
      
      {imageUrl && (
        <div className="relative w-full max-w-2xl mt-4 group">
          <img src={imageUrl} alt={prompt} className="rounded-lg shadow-2xl shadow-purple-900/50 w-full" />
          <button
            onClick={handleDownload}
            className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
            aria-label="Download image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Download</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default VibeGenerator;
