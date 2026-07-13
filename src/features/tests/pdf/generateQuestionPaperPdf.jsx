import { pdf } from '@react-pdf/renderer';
import QuestionPaperDocument from './QuestionPaperDocument';

const sanitizeFilename = (title) => {
  const base = (title || 'question-paper')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return `${base || 'question-paper'}.pdf`;
};

export const buildQuestionPaperBlob = async (paper) => {
  const instance = pdf(<QuestionPaperDocument paper={paper} />);
  return instance.toBlob();
};

export const previewQuestionPaperPdf = async (paper) => {
  const blob = await buildQuestionPaperBlob(paper);
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    URL.revokeObjectURL(url);
    throw new Error('Popup blocked — allow popups to preview the PDF');
  }
  // Revoke later so the preview tab can load the blob
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return url;
};

export const downloadQuestionPaperPdf = async (paper) => {
  const blob = await buildQuestionPaperBlob(paper);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = sanitizeFilename(paper?.title);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
};
