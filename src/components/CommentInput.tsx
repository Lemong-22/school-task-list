import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  posting?: boolean;
  disabled?: boolean;
}

export function CommentInput({ onSubmit, posting = false, disabled = false }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (content.length > 1000) {
      setError('Comment exceeds 1000 character limit');
      return;
    }

    try {
      setError(null);
      await onSubmit(content);
      setContent('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isValid = content.trim().length > 0 && content.length <= 1000;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment... (Press Enter to post, Shift+Enter for new line)"
          disabled={disabled || posting}
          className="w-full px-4 py-3 pr-12 bg-background-dark border border-border-dark rounded-lg text-sm text-text-primary-dark placeholder-text-secondary-dark focus:outline-none focus:border-primary resize-none min-h-[80px] max-h-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
          maxLength={1000}
          rows={1}
        />
        
        {/* Send Button */}
        <button
          type="submit"
          disabled={!isValid || posting || disabled}
          className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Post comment (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Character Counter */}
      <div className="flex items-center justify-between px-1">
        <span className={`text-xs ${
          content.length > 1000 
            ? 'text-red-400 font-medium' 
            : 'text-text-secondary-dark'
        }`}>
          {content.length} / 1000
        </span>
        
        {content.trim().length > 0 && (
          <span className="text-xs text-text-secondary-dark italic">
            Press Enter to post
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg text-xs">
          {error}
        </div>
      )}
    </form>
  );
}
