/**
 * PRANPAN — Live Google Gemini Verification Script
 *
 * Performs safe live AI verification without exposing API credentials.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const maskKey = (key) => {
  if (!key) return 'NOT_CONFIGURED';
  if (key.length <= 8) return '********';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

async function verifyLiveGemini() {
  console.log('====================================================');
  console.log('PRANPAN — LIVE GEMINI AI VERIFICATION');
  console.log('====================================================\n');

  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`[1/3] Checking GEMINI_API_KEY: ${maskKey(apiKey)}`);

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('placeholder')) {
    console.log('Result: GEMINI_API_KEY is not configured or uses placeholder.');
    console.log('Status: NOT TESTED\n');
    return;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  console.log(`[2/3] Configured Model: ${model}`);
  console.log('[3/3] Sending live test probe to Google Gemini API...');

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: 'Respond with exactly: VERIFIED'
    });

    const output = response.text ? response.text.trim() : '';
    console.log(`\nProbe Response: "${output}"`);
    console.log('Result: Live Gemini generation probe succeeded.');
    console.log('Status: VERIFIED\n');
  } catch (err) {
    console.error(`\nProbe Failed: ${err.message}`);
    console.log('Result: Live Gemini probe encountered an error or upstream demand spike.');
    console.log('Status: FAILED / DEGRADED\n');
  }
}

verifyLiveGemini();
