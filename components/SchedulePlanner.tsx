
import React, { useState, useCallback } from 'react';
import { generateDailySchedule } from '../services/geminiService';
import { Schedule } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';

const SchedulePlanner: React.FC = () => {
  const [goals, setGoals] = useState('Finish drum track for song X, record vocal ideas, 1 hour of sound design');
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goals.trim()) {
      setError('Please enter your goals for the day.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSchedule(null);
    try {
      const result = await generateDailySchedule(goals);
      setSchedule(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [goals]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-center mb-2">Daily Schedule Planner</h2>
      <p className="text-gray-400 text-center mb-6">List your main goals, and AI will create a balanced studio session schedule for you.</p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col items-center gap-4 mb-8">
        <textarea
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder="e.g., Mix track A, practice piano, organize sample library"
          className="w-full h-24 bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          disabled={isLoading}
        />
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'Planning...' : 'Generate Schedule'}
        </Button>
      </form>

      {isLoading && <Spinner />}
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      
      {schedule && (
        <div className="w-full max-w-2xl mt-4">
          <h3 className="text-xl font-bold text-center mb-4 text-purple-400">{schedule.title}</h3>
          <ul className="space-y-3">
            {schedule.schedule.map((item, index) => (
              <li key={index} className={`flex items-start p-4 rounded-lg ${item.isBreak ? 'bg-green-900/30' : 'bg-gray-800'}`}>
                <div className="w-24 text-purple-300 font-semibold">{item.time}</div>
                <div className="flex-1">
                  <p className="font-medium text-white">{item.task}</p>
                  <p className="text-sm text-gray-400">{item.duration}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SchedulePlanner;
