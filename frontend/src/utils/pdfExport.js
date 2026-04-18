import { jsPDF } from 'jspdf';

export const generateMeetingPDF = (meeting) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const addLine = (text, size = 11, bold = false, color = [255, 255, 255]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - 40);
    lines.forEach(line => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += size * 0.5 + 2;
    });
  };

  const addSection = (title) => {
    y += 4;
    doc.setFillColor(30, 30, 50);
    doc.rect(15, y - 5, pageWidth - 30, 10, 'F');
    addLine(title, 12, true);
    y += 2;
  };

  // Header
  doc.setFillColor(15, 15, 25);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(99, 102, 241);
  addLine('MeetAI – Meeting Report', 18, true);
  doc.setTextColor(160, 160, 180);
  addLine(meeting.title || 'Meeting Summary', 12);
  addLine(`Generated: ${new Date(meeting.createdAt || Date.now()).toLocaleString()}`, 9);
  y += 6;

  doc.setTextColor(220, 220, 240);

  // Summary
  addSection('📋 Summary');
  addLine(meeting.summary || 'No summary available.', 10);

  // Tasks
  if ((meeting.tasks || []).length > 0) {
    addSection('✅ Action Items');
    meeting.tasks.forEach((t, i) => {
      const status = t.completed ? '[Done]' : '[Pending]';
      addLine(`${i + 1}. ${t.task}`, 10, true);
      addLine(`   Assigned: ${t.person || t.user || 'Unassigned'} | Priority: ${t.priority} | Due: ${t.deadline || t.dueDate || 'N/A'} ${status}`, 9);
    });
  }

  // Decisions
  if ((meeting.decisions || []).length > 0) {
    addSection('🎯 Decisions');
    meeting.decisions.forEach((d, i) => addLine(`${i + 1}. ${d}`, 10));
  }

  // Unresolved topics
  if ((meeting.unresolved_topics || []).length > 0) {
    addSection('⚠ Unresolved Topics');
    meeting.unresolved_topics.forEach((t, i) => addLine(`${i + 1}. ${t}`, 10));
  }

  // Follow-ups
  if ((meeting.suggested_followups || []).length > 0) {
    addSection('🔄 Suggested Follow-ups');
    meeting.suggested_followups.forEach((f, i) => addLine(`${i + 1}. ${f}`, 10));
  }

  const filename = `meetai-${(meeting.title || 'meeting').replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
  doc.save(filename);
};
