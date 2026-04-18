import { jsPDF } from 'jspdf';
import { Camera, MessageCircle, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const ShareModal = ({ isOpen, onClose, content, onToast }) => {
  if (!isOpen) return null;

  const formatted = `Summary:\n${content.summary || 'N/A'}\n\nTasks:\n${
    content.tasks?.map((task) => `- ${task.task} (${task.user})`).join('\n') || 'N/A'
  }\n\nDecisions:\n${content.decisions?.map((decision) => `- ${decision}`).join('\n') || 'N/A'}`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(formatted)}`, '_blank');
    onToast('Shared successfully');
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(formatted);
    onToast('Copied to clipboard');
  };

  const instagramShare = async () => {
    await navigator.clipboard.writeText(formatted);
    onToast('Copied for Instagram sharing');
  };

  const downloadText = () => {
    const blob = new Blob([formatted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `meeting-share-${Date.now()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    onToast('Text downloaded');
  };

  const downloadPdf = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(12);
    const lines = pdf.splitTextToSize(formatted, 180);
    pdf.text(lines, 15, 20);
    pdf.save(`meeting-share-${Date.now()}.pdf`);
    onToast('PDF downloaded');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Share Meeting Result</h3>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={shareWhatsApp}><MessageCircle className="h-4 w-4 mr-2" /> WhatsApp</Button>
          <Button variant="outline" onClick={instagramShare}><Camera className="h-4 w-4 mr-2" /> Instagram</Button>
          <Button variant="outline" onClick={copyText}><Copy className="h-4 w-4 mr-2" /> Copy Link</Button>
          <Button variant="outline" onClick={downloadText}><Download className="h-4 w-4 mr-2" /> Text</Button>
        </div>

        <Button className="w-full" onClick={downloadPdf}>Download as PDF</Button>
      </div>
    </div>
  );
};

export default ShareModal;

