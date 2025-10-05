// Fix: Imported React to use React-specific types like React.ReactNode.
import type React from 'react';

export interface Tab {
  id: string;
  name: string;
  // Fix: Changed type from JSX.Element to React.ReactNode to avoid using the JSX namespace directly in a .ts file.
  icon: React.ReactNode;
}

export interface ScheduleItem {
  time: string;
  task: string;
  duration: string;
  isBreak: boolean;
}

export interface Schedule {
  title: string;
  schedule: ScheduleItem[];
}

export interface Chord {
  name: string;
  midiNotes: number[];
}

export interface Progression {
  name: string;
  key: string;
  mood: string;
  chords: Chord[];
}

export interface ChordProgressionResponse {
  progressions: Progression[];
  displayText: string;
}
