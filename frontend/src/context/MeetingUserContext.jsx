import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const MeetingUserContext = createContext(null);

export const useMeetingUser = () => {
  const ctx = useContext(MeetingUserContext);
  if (!ctx) {
    throw new Error('useMeetingUser must be used within MeetingUserProvider');
  }
  return ctx;
};

/** Names seen in the latest analyzed meeting (from tasks). */
export const extractParticipantNames = (meetingResult) => {
  if (!meetingResult?.tasks?.length) return [];
  const set = new Set();
  meetingResult.tasks.forEach((t) => {
    if (t.user && String(t.user).trim()) set.add(String(t.user).trim());
  });
  return Array.from(set).sort();
};

/** Best default participant: match email local part to a name, else first participant. */
export const pickDefaultParticipant = (participants, email) => {
  if (!participants.length) return '';
  if (!email) return participants[0];
  const local = email.split('@')[0].toLowerCase();
  const match = participants.find(
    (p) => p.toLowerCase().includes(local) || local.includes(p.toLowerCase().split(/\s+/)[0])
  );
  return match || participants[0];
};

export function MeetingUserProvider({ children, loggedInEmail }) {
  const [participantNames, setParticipantNames] = useState([]);
  const [activeParticipant, setActiveParticipant] = useState('');

  const setFromMeetingResult = useCallback(
    (meetingResult) => {
      const names = extractParticipantNames(meetingResult);
      setParticipantNames(names);
      const def = pickDefaultParticipant(names, loggedInEmail);
      setActiveParticipant(def);
    },
    [loggedInEmail]
  );

  const value = useMemo(
    () => ({
      participantNames,
      activeParticipant,
      setActiveParticipant,
      setFromMeetingResult
    }),
    [participantNames, activeParticipant, setFromMeetingResult]
  );

  return <MeetingUserContext.Provider value={value}>{children}</MeetingUserContext.Provider>;
}
