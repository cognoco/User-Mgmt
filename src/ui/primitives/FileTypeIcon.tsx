import React from 'react';
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  FileVideo,
  FileAudio,
  FileCode,
  File as FileGeneric,
} from 'lucide-react';

interface FileTypeIconProps {
  filename?: string;
  mimeType?: string;
  className?: string;
  size?: number;
}

function getFileTypeKey(filename?: string, mimeType?: string): string {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') return 'archive';
    if (mimeType.startsWith('text/')) return 'text';
    if (mimeType.includes('json') || mimeType.includes('xml')) return 'code';
  }
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'generic';
    if ([ 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg' ].includes(ext)) return 'image';
    if ([ 'pdf' ].includes(ext)) return 'pdf';
    if ([ 'xls', 'xlsx', 'csv', 'ods' ].includes(ext)) return 'spreadsheet';
    if ([ 'zip', 'rar', '7z', 'tar', 'gz' ].includes(ext)) return 'archive';
    if ([ 'mp4', 'mov', 'avi', 'webm', 'mkv' ].includes(ext)) return 'video';
    if ([ 'mp3', 'wav', 'ogg', 'flac' ].includes(ext)) return 'audio';
    if ([ 'js', 'ts', 'json', 'xml', 'html', 'css', 'py', 'java', 'c', 'cpp', 'cs', 'rb', 'go', 'php' ].includes(ext)) return 'code';
    if ([ 'txt', 'md', 'rtf' ].includes(ext)) return 'text';
  }
  return 'generic';
}

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({ filename, mimeType, className, size = 20 }) => {
  const type = getFileTypeKey(filename, mimeType);
  switch (type) {
    case 'pdf':
      return <FileText data-testid="pdf-icon" className={className} size={size} />;
    case 'image':
      return <FileImage data-testid="image-icon" className={className} size={size} />;
    case 'spreadsheet':
      return <FileSpreadsheet data-testid="spreadsheet-icon" className={className} size={size} />;
    case 'archive':
      return <FileArchive data-testid="archive-icon" className={className} size={size} />;
    case 'video':
      return <FileVideo data-testid="video-icon" className={className} size={size} />;
    case 'audio':
      return <FileAudio data-testid="audio-icon" className={className} size={size} />;
    case 'code':
      return <FileCode data-testid="code-icon" className={className} size={size} />;
    case 'text':
      return <FileText data-testid="text-icon" className={className} size={size} />;
    default:
      return <FileGeneric data-testid="generic-icon" className={className} size={size} />;
  }
};

export default FileTypeIcon; 