import { Download, Trash2, FileText, Image, FileArchive } from 'lucide-react';
import { TaskAttachment } from '../hooks/useTaskAttachments';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface AttachmentItemProps {
  attachment: TaskAttachment;
  onDelete: (attachmentId: string, filePath: string) => Promise<void>;
  onDownload: (filePath: string, fileName: string) => Promise<void>;
}

export function AttachmentItem({ attachment, onDelete, onDownload }: AttachmentItemProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canDelete = user?.id === attachment.uploaded_by;

  const getFileIcon = () => {
    const type = attachment.file_type;
    
    if (type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-400" />;
    } else if (type === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-400" />;
    } else if (type === 'application/zip') {
      return <FileArchive className="w-5 h-5 text-yellow-400" />;
    } else {
      return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await onDownload(attachment.file_path, attachment.file_name);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(attachment.id, attachment.file_path);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Delete failed:', err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-component-dark border border-border-dark rounded-lg hover:border-primary/50 transition-colors">
      {/* File Icon */}
      <div className="flex-shrink-0">
        {getFileIcon()}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary-dark truncate">
          {attachment.file_name}
        </p>
        <div className="flex items-center gap-2 text-xs text-text-secondary-dark mt-1">
          <span>{formatFileSize(attachment.file_size)}</span>
          <span>•</span>
          <span>{attachment.uploader?.full_name || 'Unknown'}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(attachment.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="p-2 text-text-secondary-dark hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
          title="Download file"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Delete Button (only for owner) */}
        {canDelete && !showDeleteConfirm && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="p-2 text-text-secondary-dark hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="Delete file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Confirm'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-3 py-1 text-xs bg-component-dark border border-border-dark text-text-secondary-dark rounded hover:bg-background-dark transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
