import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadButtonProps {
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
  label?: string;
  disabled?: boolean;
}

export function FileUploadButton({ 
  onUpload, 
  uploading = false, 
  label = 'Upload File',
  disabled = false 
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadError(null);
      await onUpload(file);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
      console.error('Upload error:', err);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.zip"
        className="hidden"
        disabled={disabled || uploading}
        aria-label="File upload input"
      />
      
      <button
        onClick={handleClick}
        disabled={disabled || uploading}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="w-4 h-4" />
        <span>{uploading ? 'Uploading...' : label}</span>
      </button>

      {uploadError && (
        <p className="text-sm text-red-300 bg-red-500/20 px-3 py-2 rounded-lg">
          {uploadError}
        </p>
      )}
    </div>
  );
}
