import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileContent: (content: string) => void;
  accept?: Record<string, string[]>;
  label?: string;
  description?: string;
  fileName?: string;
  onFileNameChange?: (name: string) => void;
}

export function FileUpload({ 
  onFileContent, 
  accept = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
  },
  label = 'Upload Resume',
  description = 'Drag & drop your resume here, or click to select',
  fileName: controlledFileName,
  onFileNameChange,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use controlled fileName if provided, otherwise use internal file state
  const displayFileName = controlledFileName || file?.name || null;
  const hasFile = !!displayFileName;

  const parseFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    
    if (fileType === 'text/plain') {
      return await file.text();
    }
    
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    
    if (fileType === 'application/pdf') {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    }
    
    throw new Error('Unsupported file type');
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);
    setError(null);
    onFileNameChange?.(selectedFile.name);

    try {
      const content = await parseFile(selectedFile);
      onFileContent(content);
    } catch (err) {
      setError('Failed to parse file. Please try a different format.');
      console.error('File parsing error:', err);
    } finally {
      setParsing(false);
    }
  }, [onFileContent, onFileNameChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    setError(null);
    onFileContent('');
    onFileNameChange?.('');
  };

  const dropzoneProps = getRootProps();

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!hasFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...dropzoneProps}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                isDragActive 
                  ? "border-primary bg-accent/50" 
                  : "border-border hover:border-primary/50 hover:bg-accent/30"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOCX, and TXT files
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="border rounded-xl p-4 bg-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {parsing ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <FileText className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-card-foreground truncate max-w-[200px]">
                    {displayFileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {parsing ? 'Parsing...' : 'Ready'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                disabled={parsing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
