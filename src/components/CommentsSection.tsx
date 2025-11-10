import { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { useTaskComments } from '../hooks/useTaskComments';
import { useAuth } from '../contexts/AuthContext';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';

interface CommentsSectionProps {
  taskId: string;
  taskTeacherId?: string; // Teacher ID of the task for delete permissions
}

export function CommentsSection({ taskId, taskTeacherId }: CommentsSectionProps) {
  const {
    comments,
    loading,
    posting,
    postComment,
    editComment,
    deleteComment,
    canEditComment,
    error
  } = useTaskComments(taskId);
  
  const { user } = useAuth();
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const prevCommentsLengthRef = useRef(comments.length);

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (comments.length > prevCommentsLengthRef.current) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCommentsLengthRef.current = comments.length;
  }, [comments.length]);

  const canDeleteComment = (commentUserId: string) => {
    // User can delete their own comments, or teacher can delete any comment on their task
    return user?.id === commentUserId || user?.id === taskTeacherId;
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 text-text-secondary-dark">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading comments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border-dark flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary-dark">Comments</h3>
          <span className="text-sm text-text-secondary-dark">
            ({comments.length})
          </span>
        </div>
      </div>

      {/* Global Error */}
      {error && (
        <div className="mx-4 mt-4 bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Comments Feed (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {comments.length > 0 ? (
          <>
            {comments.map((comment, index) => (
              <CommentItem
                key={`${comment.id}-${index}-${comment.updated_at}`}
                comment={comment}
                canEdit={canEditComment(comment)}
                onEdit={editComment}
                onDelete={deleteComment}
                canDelete={canDeleteComment(comment.user_id)}
              />
            ))}
            <div ref={commentsEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-text-secondary-dark mx-auto mb-3 opacity-50" />
              <p className="text-text-secondary-dark text-sm">
                No comments yet. Be the first to comment!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Comment Input (Fixed at Bottom) */}
      <div className="p-4 border-t border-border-dark bg-component-dark flex-shrink-0">
        <CommentInput
          onSubmit={postComment}
          posting={posting}
        />
      </div>
    </div>
  );
}
