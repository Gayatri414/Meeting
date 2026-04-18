/**
 * Smart date/time parser — converts natural language to a JS Date.
 * Handles: "tomorrow", "next monday", "5pm", "17:00", "in 2 days", etc.
 */

const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

export const parseNaturalDate = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase().trim();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // tomorrow
  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return applyTime(d, lower);
  }

  // today
  if (/\btoday\b/.test(lower)) {
    return applyTime(new Date(today), lower);
  }

  // "next <weekday>"
  const nextDay = lower.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (nextDay) {
    const target = DAYS.indexOf(nextDay[1]);
    const d = new Date(today);
    const diff = (target - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return applyTime(d, lower);
  }

  // "this <weekday>"
  const thisDay = lower.match(/\bthis\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (thisDay) {
    const target = DAYS.indexOf(thisDay[1]);
    const d = new Date(today);
    const diff = (target - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
    return applyTime(d, lower);
  }

  // bare weekday name
  const bareDay = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (bareDay) {
    const target = DAYS.indexOf(bareDay[1]);
    const d = new Date(today);
    const diff = (target - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return applyTime(d, lower);
  }

  // "in X days"
  const inDays = lower.match(/\bin\s+(\d+)\s+days?\b/);
  if (inDays) {
    const d = new Date(today);
    d.setDate(d.getDate() + parseInt(inDays[1]));
    return applyTime(d, lower);
  }

  // "in X weeks"
  const inWeeks = lower.match(/\bin\s+(\d+)\s+weeks?\b/);
  if (inWeeks) {
    const d = new Date(today);
    d.setDate(d.getDate() + parseInt(inWeeks[1]) * 7);
    return applyTime(d, lower);
  }

  // explicit date like "25th", "25 april", "april 25"
  const monthNames = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const monthMatch = lower.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\b/);
  const monthMatch2 = lower.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (monthMatch) {
    const day = parseInt(monthMatch[1]);
    const month = monthNames.indexOf(monthMatch[2].substring(0, 3));
    const d = new Date(today.getFullYear(), month, day);
    if (d < today) d.setFullYear(d.getFullYear() + 1);
    return applyTime(d, lower);
  }
  if (monthMatch2) {
    const month = monthNames.indexOf(monthMatch2[1].substring(0, 3));
    const day = parseInt(monthMatch2[2]);
    const d = new Date(today.getFullYear(), month, day);
    if (d < today) d.setFullYear(d.getFullYear() + 1);
    return applyTime(d, lower);
  }

  return null;
};

const applyTime = (date, text) => {
  // 12-hour: "5pm", "5:30pm", "5:30 pm"
  const h12 = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (h12) {
    let hours = parseInt(h12[1]);
    const mins = parseInt(h12[2] || '0');
    if (h12[3] === 'pm' && hours !== 12) hours += 12;
    if (h12[3] === 'am' && hours === 12) hours = 0;
    date.setHours(hours, mins, 0, 0);
    return date;
  }
  // 24-hour: "17:00", "09:30"
  const h24 = text.match(/\b(\d{2}):(\d{2})\b/);
  if (h24) {
    date.setHours(parseInt(h24[1]), parseInt(h24[2]), 0, 0);
    return date;
  }
  // default to 9am
  date.setHours(9, 0, 0, 0);
  return date;
};

/**
 * Extract assignee from text.
 * Handles: "with Rahul", "assign to Priya", "for John"
 */
export const extractAssignee = (text) => {
  if (!text) return '';
  const patterns = [
    /\bwith\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /\bassign(?:ed)?\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /\bfor\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /\b([A-Z][a-z]+)\s+will\b/,
    /\b([A-Z][a-z]+)\s+to\s+(?:handle|lead|manage|do)\b/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return '';
};

/**
 * Extract discussion topics from text.
 * Splits on "and", commas, "discuss", "about", etc.
 */
export const extractTopics = (text) => {
  if (!text) return [];
  // Remove date/time/assignee noise
  let clean = text
    .replace(/\b(tomorrow|today|next\s+\w+|this\s+\w+|at\s+\d+(?::\d+)?\s*(?:am|pm)?|\d{2}:\d{2})\b/gi, '')
    .replace(/\b(with|assign|for|will|meeting|discuss|about|regarding|on|the|a|an)\b/gi, ' ')
    .replace(/[,;]/g, ' | ')
    .trim();

  const parts = clean.split(/\s*\|\s*|\s+and\s+/i)
    .map(s => s.trim())
    .filter(s => s.length > 3);

  return [...new Set(parts)].slice(0, 8);
};
