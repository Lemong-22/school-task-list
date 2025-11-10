import { Paperclip } from 'lucide-react';
import { useTaskAttachments } from '../hooks/useTaskAttachments';
import { useAuth } from '../contexts/AuthContext';
import { FileUploadButton } from './FileUploadButton';
import { AttachmentItem } from './AttachmentItem';

interface AttachmentsSectionProps {
  taskId: string;
}

export function AttachmentsSection({ taskId }: AttachmentsSectionProps) {
  const { attachments, loading, uploading, uploadFile, deleteFile, downloadFile, error } = useTaskAttachments(taskId);
  const { profile } = useAuth();

  const teacherAttachments = attachments.filter(
    a => a.attachment_type === 'teacher_material'
  );

  const studentSubmissions = attachments.filter(
    a => a.attachment_type === 'student_submission'
  );

  const mySubmissions = studentSubmissions.filter(
    a => a.uploaded_by === profile?.id
  );

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 text-text-secondary-dark">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading attachments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border-dark">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary-dark">Attachments</h3>
          <span className="text-sm text-text-secondary-dark">
            ({teacherAttachments.length + studentSubmissions.length})
          </span>
        </div>

        {/* Global Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Teacher Materials Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-text-primary-dark">
              Teacher Materials
            </h4>
            {profile?.role === 'teacher' && (
              <FileUploadButton
                onUpload={(file) => uploadFile(file, 'teacher_material')}
                uploading={uploading}
                label="Upload Material"
              />
            )}
          </div>

          {teacherAttachments.length > 0 ? (
            <div className="space-y-2">
              {teacherAttachments.map(attachment => (
                <AttachmentItem
                  key={attachment.id}
                  attachment={attachment}
                  onDelete={deleteFile}
                  onDownload={downloadFile}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-background-dark rounded-lg border border-border-dark">
              <p className="text-sm text-text-secondary-dark">
                No materials uploaded yet
              </p>
            </div>
          )}
        </div>

        {/* Student Submissions Section (Teacher View) */}
        {profile?.role === 'teacher' && studentSubmissions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-primary-dark">
              Student Submissions ({studentSubmissions.length})
            </h4>
            <div className="space-y-2">
              {studentSubmissions.map(attachment => (
                <AttachmentItem
                  key={attachment.id}
                  attachment={attachment}
                  onDelete={deleteFile}
                  onDownload={downloadFile}
                />
              ))}
            </div>
          </div>
        )}

        {/* Student Submission Section (Student View) */}
        {profile?.role === 'student' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-text-primary-dark">
                My Submission
              </h4>
              <FileUploadButton
                onUpload={(file) => uploadFile(file, 'student_submission')}
                uploading={uploading}
                label="Upload Submission"
              />
            </div>

            {mySubmissions.length > 0 ? (
              <div className="space-y-2">
                {mySubmissions.map(attachment => (
                  <AttachmentItem
                    key={attachment.id}
                    attachment={attachment}
                    onDelete={deleteFile}
                    onDownload={downloadFile}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-background-dark rounded-lg border border-border-dark">
                <p className="text-sm text-text-secondary-dark">
                  You haven't submitted any files yet
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
