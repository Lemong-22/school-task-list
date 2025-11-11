import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TaskComment } from '../hooks/useTaskComments';

interface CommentItemProps {
  comment: TaskComment;
  canEdit: boolean;
  onEdit: (commentId: string, newContent: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  canDelete: boolean;
}

export function CommentItem({ comment, canEdit, onEdit, onDelete, canDelete }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const userRole = comment.profiles?.role || 'student';
  const isTeacher = userRole === 'teacher';

  // Helper function to get title color based on rarity
  const getTitleColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-yellow-400 font-extrabold';
      case 'epic':
        return 'text-purple-400 font-bold';
      case 'rare':
        return 'text-blue-400 font-semibold';
      case 'common':
      default:
        return 'text-gray-400 font-medium';
    }
  };

  // Helper function to get namecard gradient style based on name
  const getNamecardStyle = (namecardName: string | undefined): string | null => {
    if (!namecardName) return null;

    const namecardStyles: Record<string, string> = {
      // LEGENDARY - GODLIKE
      'Divine Radiance': 'bg-gradient-to-br from-yellow-200 via-white to-yellow-300 border-2 border-yellow-400 shadow-xl shadow-yellow-500/50',
      'Eternal Flame': 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-600 border-2 border-orange-400 shadow-xl shadow-orange-500/50',
      'Mystic Aurora': 'bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 border-2 border-purple-400 shadow-xl shadow-purple-500/50',
      'Celestial Storm': 'bg-gradient-to-br from-blue-700 via-purple-600 to-indigo-800 border-2 border-blue-400 shadow-xl shadow-blue-500/50',
      'Prismatic Dream': 'bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 border-2 border-pink-400 shadow-xl shadow-pink-500/50',
      'Shadow Emperor': 'bg-gradient-to-br from-gray-900 via-purple-900 to-red-900 border-2 border-purple-500 shadow-xl shadow-purple-900/50',
      'Emerald Throne': 'bg-gradient-to-br from-green-700 via-emerald-600 to-cyan-600 border-2 border-emerald-400 shadow-xl shadow-emerald-500/50',
      'Royal Crimson': 'bg-gradient-to-br from-red-900 via-red-700 to-red-900 border-2 border-red-500 shadow-lg shadow-red-900/50',
      'Galaxy Emperor': 'bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 border-2 border-indigo-500 shadow-lg shadow-indigo-900/50',
      'Golden Dynasty': 'bg-gradient-to-br from-yellow-700 via-yellow-500 to-yellow-700 border-2 border-yellow-400 shadow-lg shadow-yellow-600/50',
      'Obsidian King': 'bg-gradient-to-br from-black via-gray-900 to-red-950 border-2 border-red-700 shadow-lg shadow-red-950/50',
      'Crystal Diamond': 'bg-gradient-to-br from-gray-100 via-blue-100 to-purple-100 border-2 border-blue-300 shadow-lg shadow-blue-200/50',
      
      // EPIC - PREMIUM
      'Sunset Paradise': 'bg-gradient-to-br from-orange-500 via-pink-500 to-red-500 border border-orange-400 shadow-md',
      'Ocean Depths': 'bg-gradient-to-br from-blue-800 via-cyan-700 to-blue-900 border border-cyan-500 shadow-md',
      'Forest Royale': 'bg-gradient-to-br from-green-700 via-emerald-600 to-green-800 border border-emerald-400 shadow-md',
      'Purple Majesty': 'bg-gradient-to-br from-purple-700 via-fuchsia-600 to-purple-800 border border-purple-400 shadow-md',
      'Cyber Neon': 'bg-gradient-to-br from-pink-600 via-cyan-500 to-purple-600 border border-cyan-400 shadow-md',
      
      // RARE - STYLISH
      'Sky Blue': 'bg-gradient-to-br from-blue-400 via-sky-300 to-blue-500 border border-blue-400 shadow-sm',
      'Rose Garden': 'bg-gradient-to-br from-pink-400 via-rose-300 to-pink-500 border border-pink-400 shadow-sm',
      'Mint Fresh': 'bg-gradient-to-br from-green-400 via-teal-300 to-cyan-500 border border-teal-400 shadow-sm',
      'Lavender Dream': 'bg-gradient-to-br from-purple-300 via-pink-200 to-purple-400 border border-purple-300 shadow-sm',
      
      // COMMON - BASIC
      'Classic Gray': 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 border border-gray-500',
      'Warm Beige': 'bg-gradient-to-br from-amber-700 via-amber-600 to-amber-700 border border-amber-500',
      'Cool Slate': 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 border border-slate-500',
    };

    return namecardStyles[namecardName] || null;
  };

  // Helper function to determine if namecard is light-colored (needs dark text)
  const isLightNamecard = (namecardName: string | undefined) => {
    const lightNamecards = ['Divine Radiance', 'Crystal Diamond', 'Sky Blue', 'Rose Garden', 'Mint Fresh', 'Lavender Dream'];
    return namecardName ? lightNamecards.includes(namecardName) : false;
  };

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

  // Get the namecard style from the user's equipped namecard
  // Map the namecard name to a gradient style (icon_url contains emojis for display in shop/inventory)
  const activeNamecard = comment.profiles?.active_namecard;
  const customStyle = getNamecardStyle(activeNamecard?.name);
  const namecardStyle = customStyle
    || (isTeacher ? 'bg-primary/10 border-primary/50' : 'bg-component-dark border-border-dark');
  
  // Determine text color based on namecard type
  const hasCustomNamecard = !!customStyle;
  const isLight = isLightNamecard(activeNamecard?.name);
  const textColorClass = hasCustomNamecard 
    ? (isLight ? 'text-gray-900' : 'text-white') 
    : 'text-text-primary-dark';

  return (
    <div 
      className={`p-3 rounded-lg border transition-colors shadow-md ${namecardStyle}`}
    >
      {/* Header with Name & Title */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Author Name */}
            <span className={`font-bold text-sm ${textColorClass} drop-shadow-md`}>
              {comment.profiles?.full_name || 'Unknown User'}
            </span>
            
            {/* Equipped Title (if exists) */}
            {comment.profiles?.active_title && (
              <span className={`text-xs italic ${
                getTitleColor(comment.profiles.active_title.rarity)
              }`}>
                「{comment.profiles.active_title.name}」
              </span>
            )}
            
            {/* Role Badge */}
            <span 
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                isTeacher
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-green-500/20 text-green-300'
              }`}
            >
              {isTeacher ? 'Teacher' : 'Student'}
            </span>
          </div>
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
          <p className={`text-sm ${textColorClass} whitespace-pre-wrap break-words leading-relaxed drop-shadow-sm`}>
            {comment.content}
          </p>
          
          {/* Timestamp and Edited indicator */}
          <div className={`flex items-center gap-2 text-xs pt-1 ${
            hasCustomNamecard ? 'text-white/70' : 'text-text-secondary-dark'
          }`}>
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
