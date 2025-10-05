import type { Handler } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import type { Chord, Progression, Schedule } from "../../types";

// Initialize the AI client securely on the server-side using environment variables.
// The API_KEY is never exposed to the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


/**
 * Writes a variable-length quantity (VLQ) for MIDI delta-times.
 */
function writeVariableLength(value: number): number[] {
    if (value < 0) throw new Error("Cannot write negative variable-length quantity");
    if (value === 0) return [0x00];
    
    const buffer: number[] = [];
    let v = value;
    
    buffer.unshift(v & 0x7F);
    v >>= 7;

    while (v > 0) {
        buffer.unshift((v & 0x7F) | 0x80);
        v >>= 7;
    }
    
    return buffer;
}


/**
 * Creates a simple MIDI file from a sequence of chords.
 * Each chord is played as a whole note.
 */
function createMidiFile(chords: Chord[]): Uint8Array {
  const PPQN = 480; // Pulses per quarter note
  const wholeNoteDuration = PPQN * 4;

  const trackEvents: number[] = [];

  // Initial events for the first chord
  if (chords.length > 0) {
    const firstChord = chords[0];
    // Note On for all notes in the first chord at time 0
    for (const note of firstChord.midiNotes) {
      trackEvents.push(...writeVariableLength(0));
      trackEvents.push(0x90, note, 0x64); // Note On, channel 0, velocity 100
    }
  }

  // Subsequent chords
  for (let i = 1; i < chords.length; i++) {
    const prevChord = chords[i - 1];
    const currentChord = chords[i];

    // Wait for a whole note before changing chords
    trackEvents.push(...writeVariableLength(wholeNoteDuration));

    // Turn off all notes from the previous chord
    for (const note of prevChord.midiNotes) {
      trackEvents.push(...writeVariableLength(0));
      trackEvents.push(0x80, note, 0x40); // Note Off, channel 0, velocity 64
    }

    // Turn on all notes for the current chord
    for (const note of currentChord.midiNotes) {
      trackEvents.push(...writeVariableLength(0));
      trackEvents.push(0x90, note, 0x64); // Note On
    }
  }

  // Final Note Off events for the last chord
  if (chords.length > 0) {
    trackEvents.push(...writeVariableLength(wholeNoteDuration));
    const lastChord = chords[chords.length - 1];
    for (const note of lastChord.midiNotes) {
      trackEvents.push(...writeVariableLength(0));
      trackEvents.push(0x80, note, 0x40); // Note Off
    }
  }

  // End of Track event
  trackEvents.push(...writeVariableLength(1));
  trackEvents.push(0xFF, 0x2F, 0x00);

  const trackLength = trackEvents.length;

  const header = [
    0x4D, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // Chunk length (6)
    0x00, 0x00,             // Format 0 (single track)
    0x00, 0x01,             // Number of tracks (1)
    (PPQN >> 8) & 0xFF, PPQN & 0xFF, // Division (PPQN)
  ];

  const trackHeader = [
    0x4D, 0x54, 0x72, 0x6B, // 'MTrk'
    (trackLength >> 24) & 0xFF,
    (trackLength >> 16) & 0xFF,
    (trackLength >> 8) & 0xFF,
    trackLength & 0xFF,
  ];

  const midiBytes = [...header, ...trackHeader, ...trackEvents];
  return new Uint8Array(midiBytes);
}


const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { action, payload } = JSON.parse(event.body || '{}');
    let result: any;

    switch (action) {
      case 'generateChordProgression':
        const chordResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 4 common but soulful lofi hip hop chord progressions.
For each progression, provide: a unique 'name', the 'key', a brief 'mood' description, and a list of 'chords'.
For each chord, provide its 'name' (e.g., 'Cm7') and an array of its MIDI note numbers as 'midiNotes' (e.g., C4=60, C#4=61, D4=62).
Also provide a single 'displayText' field containing all this information formatted nicely as a single block of text for display.
The output must be a valid JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        displayText: { type: Type.STRING },
                        progressions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    key: { type: Type.STRING },
                                    mood: { type: Type.STRING },
                                    chords: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                name: { type: Type.STRING },
                                                midiNotes: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                                            },
                                            required: ["name", "midiNotes"]
                                        }
                                    }
                                },
                                required: ["name", "key", "mood", "chords"]
                            }
                        }
                    },
                    required: ["displayText", "progressions"]
                }
            }
        });
        result = JSON.parse(chordResponse.text.trim());
        break;

      case 'generateMidi':
        const { progression } = payload as { progression: Progression };
        if (!progression || !progression.chords) throw new Error("Progression data is required for MIDI generation.");
        const midiData = createMidiFile(progression.chords);
        result = Buffer.from(midiData).toString('base64');
        break;

      case 'generateStudioVibeImage':
        const { prompt } = payload;
        if (!prompt) throw new Error("Prompt is required for image generation.");
        const fullPrompt = `A highly detailed, atmospheric, cinematic photo of a music production studio. The vibe is: ${prompt}. Focus on lighting and mood. No people.`;
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });
        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
            const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
            result = `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
        break;

      case 'getCreativePrompt':
        const creativeResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Generate a single, short, and actionable creative prompt for a music producer experiencing creative block. The prompt should be unconventional and inspiring. Make it one sentence.'
        });
        result = creativeResponse.text;
        break;
      
      case 'generateDailySchedule':
        const { goals } = payload;
        if (!goals) throw new Error("Goals are required for schedule generation.");
        const scheduleResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Create a balanced daily schedule for a music producer with these main goals: ${goals}. The schedule should start at 9:00 AM, include focused work blocks, creative time, and essential breaks for lunch and rest. The output must be a JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A catchy title for the daily schedule." },
                        schedule: {
                            type: Type.ARRAY,
                            description: "The list of schedule items for the day.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING, description: "The start time of the task (e.g., '9:00 AM')." },
                                    task: { type: Type.STRING, description: "The description of the task or break." },
                                    duration: { type: Type.STRING, description: "How long the task will take (e.g., '45 mins')." },
                                    isBreak: { type: Type.BOOLEAN, description: "Whether this item is a break or a work task." }
                                },
                                required: ["time", "task", "duration", "isBreak"]
                            }
                        }
                    },
                    required: ["title", "schedule"]
                },
            },
        });
        result = JSON.parse(scheduleResponse.text.trim());
        break;

      default:
        throw new Error('Invalid action provided.');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };

  } catch (error) {
    console.error("Error in Netlify function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

export { handler };
