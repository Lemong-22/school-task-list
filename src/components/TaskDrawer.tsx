import { useEffect, useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { AttachmentsSection } from './AttachmentsSection';
import { CommentsSection } from './CommentsSection';

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  taskTeacherId?: string;
}

export function TaskDrawer({ isOpen, onClose, taskId, taskTitle, taskTeacherId }: TaskDrawerProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Trigger opening animation
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      setIsClosing(false);
      setIsRendered(false);
      onClose();
    }, 300); // Match animation duration
  };

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 bg-background-dark border-l border-border-dark z-50 shadow-2xl flex flex-col transition-all duration-300 ease-out ${
          isFullscreen ? 'w-full left-0' : 'w-full sm:w-[500px]'
        } ${
          isClosing 
            ? 'translate-x-full scale-95 opacity-0' 
            : (isRendered ? 'translate-x-0 scale-100 opacity-100' : 'translate-x-full scale-95 opacity-0')
        }`}
        style={{ transformOrigin: 'right center' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-dark flex-shrink-0">
          <h2 id="drawer-title" className="text-lg font-semibold text-text-primary-dark truncate pr-4">
            {taskTitle}
          </h2>
          <div className="flex items-center gap-2">
            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-text-secondary-dark hover:text-primary hover:bg-component-dark rounded-lg transition-colors flex-shrink-0"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Maximize'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 text-text-secondary-dark hover:text-text-primary-dark hover:bg-component-dark rounded-lg transition-colors flex-shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {isFullscreen ? (
          // Fullscreen: Side-by-side layout
          <div className="flex-1 flex overflow-hidden">
            {/* Left Side: Attachments */}
            <div className="w-1/2 border-r border-border-dark flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <AttachmentsSection taskId={taskId} />
              </div>
            </div>
            
            {/* Right Side: Comments */}
            <div className="w-1/2 flex flex-col">
              <CommentsSection taskId={taskId} taskTeacherId={taskTeacherId} />
            </div>
          </div>
        ) : (
          // Normal: Stacked layout
          <div className="flex-1 overflow-y-auto">
            {/* Attachments Section */}
            <AttachmentsSection taskId={taskId} />

            {/* Comments Section */}
            <div className="h-[500px]">
              <CommentsSection taskId={taskId} taskTeacherId={taskTeacherId} />
            </div>
          </div>
        )}
      </div>


    </>
  );
}
