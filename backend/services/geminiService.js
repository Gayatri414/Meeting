import { GoogleGenerativeAI } from '@google/generative-ai';

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

export const analyzeTranscriptWithGemini = async (transcript) => {
  try {
    const model = getModel();
    if (!model) {
      return getMockAnalysis();
    }

    const prompt = `
      Analyze the following meeting transcript and extract structured information.
      Return ONLY a valid JSON object matching this schema exactly:
      {
        "summary": "A concise paragraph summarizing the meeting.",
        "tasks": [
          {
            "user": "Name of assignee or Unassigned",
            "task": "Action item",
            "priority": "High, Medium, or Low",
            "deadline": "Deadline or unspecified"
          }
        ],
        "decisions": ["Decision 1"],
        "questions": ["Question 1"],
        "risks": ["Risk 1"]
      }

      Transcript:
      """
      ${transcript}
      """
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Enhanced JSON parsing
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return getMockAnalysis();
  }
};

export const transcribeAudioWithGemini = async (buffer, mimeType = 'audio/wav') => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return {
        transcript:
          '[Demo transcript] This is placeholder text. Set GEMINI_API_KEY in backend/.env and upload a real audio file for transcription.'
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const base64 = buffer.toString('base64');

    const prompt =
      'Transcribe the speech in this audio to plain text. Output only the spoken words in English, no labels or timestamps.';

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType || 'audio/wav',
          data: base64
        }
      }
    ]);

    const response = await result.response;
    const text = response.text().trim();
    return { transcript: text };
  } catch (error) {
    console.error('Audio transcription failed:', error);
    return {
      transcript:
        '[Transcription failed] Check GEMINI_API_KEY and that the model supports your audio format. Try WAV or MP3.'
    };
  }
};

export const chatWithGemini = async (message, history = []) => {
  try {
    const model = getModel();
    if (!model) {
      return `Mock assistant: I received your message - "${message}". Add GEMINI_API_KEY in backend .env for live responses.`;
    }

    // Convert history to Gemini format
    const contents = history.slice(-10).map(item => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.text }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const result = await model.generateContent({ contents });
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini chat failed:', error);
    return 'I could not process that right now. Please try again in a moment.';
  }
};

const getMockAnalysis = () => ({
  summary:
    'The team reviewed the release plan, assigned core deliverables, and highlighted timeline pressure as the primary risk.',
  tasks: [
    { user: 'Alex', task: 'Complete backend API', priority: 'High', deadline: 'Friday' },
    { user: 'Jordan', task: 'Finish frontend integration', priority: 'Medium', deadline: 'Next Monday' }
  ],
  decisions: ['Proceed with dark theme UI'],
  questions: ['Do we have final analytics page designs?'],
  risks: ['Tight backend delivery timeline']
});

