import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/adapters/database/supabase-provider';

/**
 * Headless File Manager
 *
 * Provides the behaviour of the FileManager component without UI rendering.
 */
interface FileItem {
  name: string;
  id?: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
}

export interface FileManagerProps {
  bucket?: string;
  initialPath?: string;
  allowFolders?: boolean;
  onFileUpload?: (file: File, path: string) => void;
  onFileDelete?: (file: FileItem) => void;
  onFileRename?: (oldName: string, newName: string) => void;
  render: (props: {
    files: FileItem[];
    loading: boolean;
    error: string | null;
    uploading: boolean;
    uploadError: string | null;
    currentPath: string;
    deleteDialog: { open: boolean; file?: FileItem };
    renameDialog: { open: boolean; file?: FileItem };
    renameValue: string;
    fetchFiles: () => Promise<void>;
    handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    getDownloadUrl: (file: FileItem) => string;
    handleDelete: () => Promise<void>;
    handleRename: () => Promise<void>;
    handleNavigate: (folder: string) => void;
    handleBreadcrumbClick: (index: number) => void;
    setDeleteDialog: (state: { open: boolean; file?: FileItem }) => void;
    setRenameDialog: (state: { open: boolean; file?: FileItem }) => void;
    setRenameValue: (val: string) => void;
  }) => React.ReactNode;
}

const DEFAULT_BUCKET = 'files';

export default function FileManager({
  bucket = DEFAULT_BUCKET,
  initialPath = '',
  allowFolders = true,
  onFileUpload,
  onFileDelete,
  onFileRename,
  render
}: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; file?: FileItem }>({ open: false });
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; file?: FileItem }>({ open: false });
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.storage.from(bucket).list(currentPath, { limit: 100, offset: 0 });
    if (error) {
      setError(error.message);
      setFiles([]);
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [currentPath, bucket]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const path = currentPath ? `${currentPath}/${file.name}` : file.name;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) {
      setUploadError(error.message);
    } else {
      onFileUpload?.(file, path);
      fetchFiles();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getDownloadUrl = (file: FileItem) => {
    const path = currentPath ? `${currentPath}/${file.name}` : file.name;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || '#';
  };

  const handleDelete = async () => {
    if (!deleteDialog.file) return;
    const path = currentPath ? `${currentPath}/${deleteDialog.file.name}` : deleteDialog.file.name;
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      setError(error.message);
    } else {
      onFileDelete?.(deleteDialog.file);
      fetchFiles();
    }
    setDeleteDialog({ open: false });
  };

  const handleRename = async () => {
    if (!renameDialog.file || !renameValue) return;
    const oldPath = currentPath ? `${currentPath}/${renameDialog.file.name}` : renameDialog.file.name;
    const newPath = currentPath ? `${currentPath}/${renameValue}` : renameValue;
    const { error } = await supabase.storage.from(bucket).move(oldPath, newPath);
    if (error) {
      setError(error.message);
    } else {
      onFileRename?.(renameDialog.file.name, renameValue);
      fetchFiles();
    }
    setRenameDialog({ open: false });
    setRenameValue('');
  };

  const handleNavigate = (folder: string) => {
    if (!allowFolders) return;
    setCurrentPath(currentPath ? `${currentPath}/${folder}` : folder);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentPath('');
    } else {
      const parts = currentPath.split('/').filter(Boolean).slice(0, index + 1);
      setCurrentPath(parts.join('/'));
    }
  };

  return (
    <>{render({
      files,
      loading,
      error,
      uploading,
      uploadError,
      currentPath,
      deleteDialog,
      renameDialog,
      renameValue,
      fetchFiles,
      handleUpload,
      getDownloadUrl,
      handleDelete,
      handleRename,
      handleNavigate,
      handleBreadcrumbClick,
      setDeleteDialog,
      setRenameDialog,
      setRenameValue
    })}</>
  );
}
