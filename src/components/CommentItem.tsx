import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { TaskComment } from '../hooks/useTaskComments';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface CommentItemProps {
  comment: TaskComment;
  canEdit: boolean;
  onEdit: (commentId: string, newContent: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  canDelete: boolean;
}

export function CommentItem({ comment, canEdit, onEdit, onDelete, canDelete }: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const isOwnComment = user?.id === comment.user_id;

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setEditError('Comment cannot be empty');
      return;
    }

    if (editContent.length > 1000) {
      setEditError('Comment exceeds 1000 character limit');
      return;
    }

    try {
      setEditError(null);
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    } catch (err: any) {
      setEditError(err.message || 'Failed to edit comment');
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
    setEditError(null);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(comment.id);
      // Success - close the confirm dialog
      setShowDeleteConfirm(false);
    } catch (err: any) {
      // Error - show error and reset state
      console.error('Delete failed:', err);
      alert(err.message || 'Failed to delete comment. You may not have permission.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg border transition-colors ${
        isOwnComment 
          ? 'bg-primary/5 border-primary/30' 
          : 'bg-component-dark border-border-dark'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {/* Author Name */}
          <span className="font-medium text-text-primary-dark text-sm">
            {comment.user?.full_name || 'Unknown User'}
          </span>
          
          {/* Role Badge */}
          <span 
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              comment.user?.role === 'teacher'
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-green-500/20 text-green-300'
            }`}
          >
            {comment.user?.role === 'teacher' ? 'Teacher' : 'Student'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          {canEdit && !isEditing && !showDeleteConfirm && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-text-secondary-dark hover:text-primary hover:bg-primary/10 rounded transition-colors"
              title="Edit comment"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete Button */}
          {canDelete && !isEditing && !showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="p-1.5 text-text-secondary-dark hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
              title="Delete comment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isEditing ? (
        <div className="space-y-2">
          <p className="text-sm text-text-primary-dark whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          
          {/* Timestamp and Edited indicator */}
          <div className="flex items-center gap-2 text-xs text-text-secondary-dark">
            <span>
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.is_edited && (
              <>
                <span>•</span>
                <span className="italic">Edited</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Edit Textarea */}
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-sm text-text-primary-dark focus:outline-none focus:border-primary resize-none"
            rows={3}
            maxLength={1000}
            autoFocus
          />
          
          {/* Character Counter */}
          <div className="flex items-center justify-between">
            <span className={`text-xs ${
              editContent.length > 1000 ? 'text-red-400' : 'text-text-secondary-dark'
            }`}>
              {editContent.length} / 1000
            </span>
          </div>

          {/* Error Message */}
          {editError && (
            <p className="text-xs text-red-300 bg-red-500/20 px-2 py-1 rounded">
              {editError}
            </p>
          )}

          {/* Edit Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1.5 bg-component-dark border border-border-dark text-text-secondary-dark text-sm rounded-lg hover:bg-background-dark transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-300 mb-3">
            Are you sure you want to delete this comment?
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-3 py-1.5 bg-component-dark border border-border-dark text-text-secondary-dark text-sm rounded-lg hover:bg-background-dark transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
