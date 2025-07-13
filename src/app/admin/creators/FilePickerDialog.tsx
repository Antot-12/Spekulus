
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFiles } from '@/lib/db/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, File as FileIcon } from 'lucide-react';

type FileInfo = {
  id: number;
  filename: string | null;
  mimeType: string | null;
};

type FilePickerDialogProps = {
  children: React.ReactNode;
  onFileSelect: (id: number) => void;
  fileTypes?: string[]; // e.g., ['image/png', 'image/jpeg']
};

const isImageFile = (mimeType: string | null): boolean => {
    return mimeType ? mimeType.startsWith('image/') : false;
}

export function FilePickerDialog({ children, onFileSelect, fileTypes = ['image/'] }: FilePickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFiles();
      setFiles(data);
    } catch (error) {
      console.error('Failed to fetch files for picker:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchFiles();
    }
  }, [open, fetchFiles]);
  
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const typeMatch = fileTypes.some(type => file.mimeType?.startsWith(type));
      const nameMatch = file.filename?.toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && nameMatch;
    });
  }, [files, searchTerm, fileTypes]);
  
  const handleSelect = (id: number) => {
    onFileSelect(id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose an Existing File</DialogTitle>
           <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-square" />)}
            </div>
          ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredFiles.map(file => (
                    <button 
                        key={file.id} 
                        onClick={() => handleSelect(file.id)}
                        className="group relative aspect-square overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                         <div className="w-full h-full bg-muted flex items-center justify-center">
                            {isImageFile(file.mimeType) ?
                            <img src={`/api/images/${file.id}`} alt={file.filename || ''} className="h-full w-full object-cover"/>
                            : <FileIcon className="h-8 w-8 text-muted-foreground"/>
                            }
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"/>
                        <p className="absolute bottom-0 left-0 right-0 p-1 text-xs text-center bg-black/70 text-white truncate">{file.filename}</p>
                    </button>
                ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
