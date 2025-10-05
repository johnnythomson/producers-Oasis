import React, { useState, useCallback, useEffect } from 'react';
import { generateChordProgression, generateMidiFile } from '../services/geminiService';
import Button from './common/Button';
import Spinner from './common/Spinner';
import Card from './common/Card';
import { ChordProgressionResponse, Progression } from '../types';

const ChordGenerator: React.FC = () => {
  const [progressionData, setProgressionData] = useState<ChordProgressionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportingProgressionName, setExportingProgressionName] = useState<string | null>(null);

  const getProgressions = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await generateChordProgression();
      setProgressionData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate chord progressions. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    getProgressions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = useCallback(async (progression: Progression) => {
    setExportingProgressionName(progression.name);
    try {
      const base64Midi = await generateMidiFile(progression);
      
      const byteCharacters = atob(base64Midi);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/midi' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const sanitizedName = progression.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      link.download = `${sanitizedName || 'chord_progression'}.mid`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred during MIDI export.');
    } finally {
      setExportingProgressionName(null);
    }
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-center mb-2">Lofi Chord Progressions</h2>
      <p className="text-gray-400 text-center mb-6">Need inspiration? Generate soulful chords and export them to your DAW.</p>
      
      <Button onClick={getProgressions} isLoading={isLoading} className="mb-8">
        {isLoading ? 'Generating...' : 'Generate New Chords'}
      </Button>
      
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <div className="w-full max-w-2xl space-y-4">
            {progressionData?.progressions.map((prog) => (
              <Card key={prog.name}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-purple-400">{prog.name}</h3>
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold">Key:</span> {prog.key} | <span className="font-semibold">Mood:</span> {prog.mood}
                    </p>
                    <p className="mt-2 font-mono text-purple-200">{prog.chords.map(c => c.name).join(' → ')}</p>
                  </div>
                  <Button 
                    onClick={() => handleExport(prog)} 
                    isLoading={exportingProgressionName === prog.name}
                    className="px-4 py-2 text-sm"
                  >
                    {exportingProgressionName === prog.name ? 'Exporting...' : 'Export MIDI'}
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default ChordGenerator;
