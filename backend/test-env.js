console.log('--- DIAGNOSTIC START ---');
console.log('Folder:', process.cwd());
console.log('Node Version:', process.version);
import dotenv from 'dotenv';
dotenv.config();
console.log('GEMINI_KEY_EXISTS:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_KEY_START:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) : 'MISSING');
console.log('--- DIAGNOSTIC END ---');
