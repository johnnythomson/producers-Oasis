
import React, { useState, useCallback, useEffect } from 'react';
import { generateChordProgression } from '../services/geminiService';
import Button from './common/Button';
import Spinner from './common/Spinner';

const ChordGenerator: React.FC = () => {
  const [progressions, setProgressions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getProgressions = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await generateChordProgression();
      setProgressions(result);
    } catch (err) {
      setError('Failed to generate chord progressions. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    getProgressions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-center mb-2">Lofi Chord Progressions</h2>
      <p className="text-gray-400 text-center mb-6">Need inspiration? Generate some soulful chords to get started.</p>
      
      <Button onClick={getProgressions} isLoading={isLoading} className="mb-8">
        {isLoading ? 'Generating...' : 'Generate New Chords'}
      </Button>
      
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="w-full max-w-2xl bg-gray-900/50 p-6 rounded-lg prose prose-invert prose-p:text-gray-300 prose-headings:text-purple-400">
            <pre className="whitespace-pre-wrap font-mono text-sm">{progressions}</pre>
        </div>
      )}
    </div>
  );
};

export default ChordGenerator;
