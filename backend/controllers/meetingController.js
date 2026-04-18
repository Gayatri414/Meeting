import Meeting from '../models/Meeting.js';
import { analyzeTranscriptWithGemini, transcribeAudioWithGemini } from '../services/geminiService.js';

export const analyzeMeeting = async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // Call Gemini API
    const analysis = await analyzeTranscriptWithGemini(transcript);

    // Save to Database
    const newMeeting = new Meeting({
      transcript,
      summary: analysis.summary,
      tasks: analysis.tasks || [],
      decisions: analysis.decisions || [],
      questions: analysis.questions || [],
      risks: analysis.risks || []
    });

    const savedMeeting = await newMeeting.save();

    res.status(201).json(savedMeeting);
  } catch (error) {
    console.error('Error in analyzeMeeting:', error);
    res.status(500).json({ error: 'Failed to analyze meeting' });
  }
};

export const getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });
    res.status(200).json(meetings);
  } catch (error) {
    console.error('Error in getAllMeetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

export const transcribeAudio = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'Audio file is required (field name: audio)' });
    }

    const mimeType = req.file.mimetype || 'audio/wav';
    const { transcript } = await transcribeAudioWithGemini(req.file.buffer, mimeType);
    return res.status(200).json({ transcript });
  } catch (error) {
    console.error('transcribeAudio:', error);
    return res.status(500).json({ error: 'Failed to transcribe audio' });
  }
};

export const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.status(200).json(meeting);
  } catch (error) {
    console.error('Error in getMeetingById:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
};
