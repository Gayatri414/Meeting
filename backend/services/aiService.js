/**
 * MeetAI – AI Service (Groq)
 * Models used:
 *   Text/Analysis : llama-3.3-70b-versatile   (14,400 req/day free)
 *   Vision        : llama-3.2-11b-vision-preview (free)
 *   Audio         : whisper-large-v3-turbo      (7,200 req/day free)
 */

import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import os from 'os';

const TEXT_MODEL   = 'llama-3.3-70b-versatile';
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const AUDIO_MODEL  = 'whisper-large-v3-turbo';

const getClient = () => {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your_groq_api_key_here') {
    console.warn('⚠️  GROQ_API_KEY not set — using mock data');
    return null;
  }
  return new Groq({ apiKey: key });
};

// ─── Analyze transcript ───────────────────────────────────────────────────────

export const analyzeTranscript = async (transcript) => {
  const groq = getClient();
  if (!groq) return getMockAnalysis();

  try {
    const completion = await groq.chat.completions.create({
      model: TEXT_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert meeting analysis AI. Extract ALL structured data from meeting transcripts.

Return valid JSON matching this EXACT schema — no extra keys, no markdown:
{
  "summary": "Concise paragraph summarizing the meeting",
  "tasks": [
    {
      "person": "Assignee name or Unassigned",
      "task": "Clear action item description",
      "priority": "High|Medium|Low",
      "dueDate": "deadline string or unspecified",
      "status": "pending",
      "type": "bug|feature|research|design|devops|meeting|other",
      "syncTarget": "jira|linear|notion|none",
      "syncReason": "One sentence why this tool fits"
    }
  ],
  "followUpMeetings": [
    {
      "title": "Meeting title",
      "reason": "Why this follow-up is needed",
      "suggestedDate": "natural language date or unspecified",
      "participants": ["name1", "name2"],
      "agenda": ["agenda item 1"]
    }
  ],
  "decisions": ["Decision made"],
  "unresolved_topics": ["Unresolved topic"],
  "suggested_followups": ["Follow-up action"],
  "new_meetings": ["Meeting mentioned"],
  "questions": ["Open question"],
  "risks": ["Risk or concern"]
}

Sync target rules — assign based on task type:
- "jira": bugs, sprint tasks, engineering issues, QA, devops
- "linear": product features, roadmap items, design tasks, UX work
- "notion": research, documentation, notes, knowledge base, meeting summaries
- "none": personal tasks, vague items, non-trackable items

Extract EVERY action item. Use "Unassigned" if no person is mentioned.
Detect ALL follow-up meetings — look for phrases like "let's meet", "schedule a call", "follow up", "next meeting", "tomorrow", "next week".`
        },
        {
          role: 'user',
          content: `Analyze this meeting transcript and extract all tasks, follow-up meetings, and actionable items:\n\n"""\n${transcript}\n"""`
        }
      ]
    });

    const text = completion.choices[0]?.message?.content || '{}';
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : getMockAnalysis();
    }
  } catch (err) {
    console.error('❌ Groq analysis error:', err.message, err.status || '');
    return getMockAnalysis();
  }
};

// ─── Transcribe audio ─────────────────────────────────────────────────────────

export const transcribeAudio = async (buffer, mimeType = 'audio/wav') => {
  const groq = getClient();
  if (!groq) {
    return { transcript: '[Demo] Set GROQ_API_KEY in backend/.env for real transcription.' };
  }

  // Map mime types to extensions Groq accepts
  const extMap = {
    'audio/mpeg': 'mp3', 'audio/mp3': 'mp3',
    'audio/wav':  'wav', 'audio/x-wav': 'wav',
    'audio/mp4':  'mp4', 'audio/m4a': 'm4a', 'audio/x-m4a': 'm4a',
    'audio/ogg':  'ogg', 'audio/flac': 'flac',
    'audio/webm': 'webm',
    'video/mpeg': 'mp3', 'audio/mpg': 'mp3', 'audio/mp2': 'mp3',
  };
  const ext = extMap[mimeType] || 'mp3';

  // Write buffer to a temp file (Groq SDK needs a file path or File object)
  const tmpPath = path.join(os.tmpdir(), `meetai_audio_${Date.now()}.${ext}`);
  try {
    fs.writeFileSync(tmpPath, buffer);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: AUDIO_MODEL,
      response_format: 'text',
      language: 'en',
    });

    return { transcript: typeof transcription === 'string' ? transcription.trim() : transcription?.text?.trim() || '' };
  } catch (err) {
    console.error('❌ Groq transcription error:', err.message, err.status || '');
    return { transcript: `[Transcription failed] ${err.message}` };
  } finally {
    try { fs.unlinkSync(tmpPath); } catch {}
  }
};

// ─── Analyze screenshot ───────────────────────────────────────────────────────

export const analyzeScreenshot = async (base64Image, context = '') => {
  const groq = getClient();
  if (!groq) {
    return { analysis: '[Demo] Set GROQ_API_KEY in backend/.env for screenshot analysis.' };
  }

  try {
    // Strip data URL prefix if present
    const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const dataUrl = `data:image/png;base64,${imageData}`;

    const completion = await groq.chat.completions.create({
      model: VISION_MODEL,
      temperature: 0.3,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: context
                ? `You are analyzing a screenshot from a meeting. Meeting context: "${context}"\n\nAnalyze this screenshot and extract:\n1. Key information visible (text, charts, diagrams, slides)\n2. Action items or tasks visible\n3. Important decisions or data shown\n4. Any relevant meeting content\n\nBe concise and structured.`
                : `Analyze this screenshot from a meeting. Extract:\n1. Key information visible (text, charts, diagrams, slides)\n2. Any action items or tasks\n3. Important data or decisions shown\n4. Relevant meeting content\n\nBe concise and structured.`
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl }
            }
          ]
        }
      ]
    });

    const analysis = completion.choices[0]?.message?.content || 'No analysis available.';
    return { analysis };
  } catch (err) {
    console.error('Groq vision error:', err.message);
    return { analysis: `[Analysis failed] ${err.message}` };
  }
};

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const chat = async (message, history = [], meetingContext = '') => {
  const groq = getClient();
  if (!groq) {
    return `Demo mode: received "${message}". Add GROQ_API_KEY to backend/.env for live responses.`;
  }

  try {
    const systemPrompt = meetingContext
      ? `You are MeetAI Assistant, an expert at analyzing meetings. 
Current meeting context:
${meetingContext}

Answer questions based on this meeting data. Be concise and helpful.`
      : `You are MeetAI Assistant. Help users with meeting analysis, task management, and productivity. Be concise and helpful.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history
        .filter(m => m.text?.trim())
        .slice(-10)
        .map(m => ({
          role: ['bot', 'model', 'assistant'].includes(m.role) ? 'assistant' : 'user',
          content: m.text
        })),
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: TEXT_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
      messages
    });

    return completion.choices[0]?.message?.content?.trim() || 'No response received.';
  } catch (err) {
    console.error('Groq chat error:', err.message);
    return 'I could not process that right now. Please try again.';
  }
};

// ─── Jira sync ────────────────────────────────────────────────────────────────

export const syncToJira = async ({ host, email, token, projectKey, tasks }) => {
  const { default: axios } = await import('axios');
  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const results = [];

  for (const task of tasks) {
    try {
      const priority = { High: 'High', Medium: 'Medium', Low: 'Low' }[task.priority] || 'Medium';
      const res = await axios.post(
        `https://${host}/rest/api/3/issue`,
        {
          fields: {
            project: { key: projectKey },
            summary: task.task,
            description: {
              type: 'doc', version: 1,
              content: [{ type: 'paragraph', content: [{ type: 'text', text: `Assigned to: ${task.person || 'Unassigned'}\nDue: ${task.dueDate || 'unspecified'}` }] }]
            },
            issuetype: { name: task.type === 'bug' ? 'Bug' : 'Task' },
            priority: { name: priority },
            ...(task.person && task.person !== 'Unassigned' ? {} : {})
          }
        },
        { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json', Accept: 'application/json' } }
      );
      results.push({ task: task.task, issueKey: res.data.key, url: `https://${host}/browse/${res.data.key}`, success: true });
    } catch (err) {
      results.push({ task: task.task, success: false, error: err.response?.data?.errorMessages?.[0] || err.message });
    }
  }
  return results;
};

// ─── Linear sync ──────────────────────────────────────────────────────────────

export const syncToLinear = async ({ apiKey, teamId, tasks }) => {
  const { default: axios } = await import('axios');
  const results = [];

  for (const task of tasks) {
    try {
      const priorityMap = { High: 1, Medium: 2, Low: 3 };
      const mutation = `
        mutation CreateIssue($title: String!, $teamId: String!, $priority: Int, $description: String) {
          issueCreate(input: { title: $title, teamId: $teamId, priority: $priority, description: $description }) {
            success
            issue { id identifier url title }
          }
        }
      `;
      const res = await axios.post(
        'https://api.linear.app/graphql',
        {
          query: mutation,
          variables: {
            title: task.task,
            teamId,
            priority: priorityMap[task.priority] || 2,
            description: `Assigned to: ${task.person || 'Unassigned'}\nDue: ${task.dueDate || 'unspecified'}\nType: ${task.type || 'other'}`
          }
        },
        { headers: { Authorization: apiKey, 'Content-Type': 'application/json' } }
      );
      const issue = res.data?.data?.issueCreate?.issue;
      results.push({ task: task.task, issueKey: issue?.identifier, url: issue?.url, success: true });
    } catch (err) {
      results.push({ task: task.task, success: false, error: err.message });
    }
  }
  return results;
};

// ─── Notion export ────────────────────────────────────────────────────────────

export const exportToNotion = async (notionToken, databaseId, meetingData) => {
  const { default: axios } = await import('axios');
  try {
    const response = await axios.post(
      'https://api.notion.com/v1/pages',
      {
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: meetingData.title || 'Meeting Summary' } }] },
          Date: { date: { start: new Date().toISOString().split('T')[0] } }
        },
        children: [
          { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ text: { content: 'Summary' } }] } },
          { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: meetingData.summary || '' } }] } },
          { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ text: { content: 'Action Items' } }] } },
          ...(meetingData.tasks || []).map(t => ({
            object: 'block', type: 'to_do',
            to_do: {
              rich_text: [{ text: { content: `${t.task} (${t.person || t.user || 'Unassigned'})` } }],
              checked: t.completed || false
            }
          })),
          { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ text: { content: 'Decisions' } }] } },
          ...(meetingData.decisions || []).map(d => ({
            object: 'block', type: 'bulleted_list_item',
            bulleted_list_item: { rich_text: [{ text: { content: d } }] }
          }))
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${notionToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        }
      }
    );
    return { success: true, url: response.data.url };
  } catch (err) {
    console.error('Notion export failed:', err.message);
    throw new Error(err.response?.data?.message || 'Notion export failed');
  }
};

// ─── Mock fallback ────────────────────────────────────────────────────────────

const getMockAnalysis = () => ({
  summary: 'The team reviewed the release plan, assigned core deliverables, and highlighted timeline pressure as the primary risk.',
  tasks: [
    { person: 'Alex',   user: 'Alex',   task: 'Fix login page crash on Safari',     priority: 'High',   dueDate: 'Friday',      status: 'pending', type: 'bug',     syncTarget: 'jira',   syncReason: 'Bug fixes belong in Jira for sprint tracking' },
    { person: 'Jordan', user: 'Jordan', task: 'Design new onboarding flow',          priority: 'Medium', dueDate: 'Next Monday', status: 'pending', type: 'design',  syncTarget: 'linear', syncReason: 'Design/UX tasks fit Linear product workflow' },
    { person: 'Sam',    user: 'Sam',    task: 'Document API endpoints in Confluence', priority: 'Low',   dueDate: 'unspecified', status: 'pending', type: 'research', syncTarget: 'notion', syncReason: 'Documentation is best tracked in Notion' }
  ],
  followUpMeetings: [
    {
      title: 'Design Review',
      reason: 'Review the new onboarding flow designs before implementation',
      suggestedDate: 'Thursday',
      participants: ['Jordan', 'Alex'],
      agenda: ['Review wireframes', 'Approve color scheme', 'Finalize copy']
    }
  ],
  decisions:           ['Proceed with dark theme UI', 'Launch beta on Friday'],
  unresolved_topics:   ['Final analytics page designs pending'],
  suggested_followups: ['Schedule design review', 'Send API docs to team'],
  new_meetings:        ['Design review scheduled for Thursday'],
  questions:           ['Do we have final analytics page designs?'],
  risks:               ['Tight backend delivery timeline']
});
