
import React, { useState, useCallback, useEffect } from 'react';
import { getCreativePrompt } from '../services/geminiService';
import Button from './common/Button';

const BlockBreaker: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPrompt = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getCreativePrompt();
      setPrompt(result);
    } catch (err) {
      setError('Failed to get a prompt. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl font-bold mb-2">Creative Block Breaker</h2>
      <p className="text-gray-400 mb-6">Stuck? Hit the button for a fresh idea.</p>
      
      <div className="w-full max-w-2xl min-h-[150px] flex items-center justify-center bg-gray-900/50 p-8 rounded-lg mb-8 border border-dashed border-gray-600">
        {isLoading ? (
          <p className="text-gray-400">Thinking of an idea...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <p className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400">
            "{prompt}"
          </p>
        )}
      </div>

      <Button onClick={fetchPrompt} isLoading={isLoading}>
        {isLoading ? 'Getting Idea...' : 'Give Me Another'}
      </Button>
    </div>
  );
};

export default BlockBreaker;
