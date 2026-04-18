import { chatWithGemini } from '../services/geminiService.js';

export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await chatWithGemini(message, history);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat API failed:', error);
    return res.status(500).json({ error: 'Chat failed. Please try again.' });
  }
};

