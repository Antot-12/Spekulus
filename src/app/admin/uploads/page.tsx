
'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  UploadCloud,
  Trash2,
  Copy,
  Loader2,
  FileImage,
  Search,
  Link as LinkIcon,
  LayoutGrid,
  List,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Expand
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle as RDialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getImages, deleteImage } from '@/lib/db/actions'
import { logAction } from '@/lib/logger'
import { format } from 'date-fns'

type ImageInfo = {
  id: number
  filename: string | null
  mimeType: string | null
  createdAt: Date
  size: number | null
}

type ViewMode = 'grid' | 'list';
type SortMode = 'newest' | 'oldest' | 'name';

const IMAGES_PER_PAGE = 12;

function formatFileSize(bytes: number | null | undefined): string {
    if (bytes === null || bytes === undefined) return 'N/A';
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}


export default function UploadsAdminPage() {
  const { toast } = useToast()
  const [images, setImages] = useState<ImageInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchImages = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getImages()
      setImages(data)
    } catch (error) {
      toast({
        title: 'Fetch Error',
        description: 'Could not load image library.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const filteredAndSortedImages = useMemo(() => {
    return images
      .filter(image =>
        image.filename?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortMode) {
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'name':
            return (a.filename || '').localeCompare(b.filename || '');
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [images, searchTerm, sortMode]);
  
  const totalPages = Math.ceil(filteredAndSortedImages.length / IMAGES_PER_PAGE);
  const paginatedImages = filteredAndSortedImages.slice((currentPage - 1) * IMAGES_PER_PAGE, currentPage * IMAGES_PER_PAGE);


  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    toast({
      title: 'Uploading...',
      description: 'Please wait while the file is uploaded.',
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (result.success) {
        toast({
          title: 'Upload Successful',
          description: `${file.name} has been uploaded.`,
        })
        logAction('File Upload', 'Success', `Uploaded file: ${file.name}`)
        fetchImages() // Refresh the list
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      })
      logAction('File Upload', 'Failure', error.message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (id: number) => {
    const imageToDelete = images.find((img) => img.id === id)
    try {
      await deleteImage(id)
      toast({
        title: 'Image Deleted',
        description: `Image ID ${id} has been deleted.`,
        variant: 'destructive',
      })
      logAction(
        'File Delete',
        'Success',
        `Deleted image: ${imageToDelete?.filename || `ID ${id}`}`
      )
      fetchImages() // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Could not delete the image.',
        variant: 'destructive',
      })
      logAction('File Delete', 'Failure', `Failed to delete image ID ${id}.`)
    }
  }

  const copyToClipboard = (text: string, type: 'ID' | 'URL') => {
    navigator.clipboard.writeText(text)
    toast({ description: `Copied image ${type} to clipboard.` })
  }
  
  const copyFullUrl = (imageId: number) => {
    const url = `${window.location.origin}/api/images/${imageId}`;
    copyToClipboard(url, 'URL');
  }

  const renderPagination = () => (
     totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft /></Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft /></Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight /></Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight /></Button>
            </div>
        </div>
    )
  );

  return (
    <Card className="opacity-0 animate-fade-in-up">
      <CardHeader>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <CardTitle>Manage Uploads</CardTitle>
            <CardDescription>
              Browse, search, upload, and delete images from your site's library.
            </CardDescription>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            Upload File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*"
            className="hidden"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 mt-4 p-2 border rounded-lg bg-muted/50">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by filename..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-10"
                />
            </div>
            <div className="flex gap-2">
                <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
                    <SelectTrigger className="w-full md:w-[150px]">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="name">Filename (A-Z)</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex rounded-md border bg-background p-1">
                    <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                        <LayoutGrid className="h-5 w-5"/>
                    </Button>
                    <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                        <List className="h-5 w-5"/>
                    </Button>
                </div>
            </div>
        </div>

      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : paginatedImages.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedImages.map((image) => (
                  <Card key={image.id} className="group relative overflow-hidden flex flex-col">
                    <Dialog>
                       <DialogTrigger asChild>
                         <div className="aspect-square w-full bg-muted cursor-pointer resize overflow-auto relative">
                            <img
                                src={`/api/images/${image.id}`}
                                alt={image.filename || `Image ${image.id}`}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                loading="lazy"
                            />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <Expand className="w-8 h-8 text-white drop-shadow-lg" />
                             </div>
                         </div>
                       </DialogTrigger>
                       <DialogContent className="max-w-4xl p-2 bg-transparent border-none shadow-none">
                            <DialogHeader>
                              <RDialogTitle className="sr-only">Image Preview: {image.filename || `Image ${image.id}`}</RDialogTitle>
                            </DialogHeader>
                            <img src={`/api/images/${image.id}`} alt={image.filename || ''} className="max-h-[90vh] w-auto h-auto rounded-lg mx-auto" />
                       </DialogContent>
                    </Dialog>
                    <div className="p-4 border-t flex-grow flex flex-col justify-between">
                        <div>
                            <p className="text-sm font-semibold truncate" title={image.filename || ''}>{image.filename || 'Untitled'}</p>
                            <p className="text-xs text-muted-foreground">ID: {image.id}</p>
                            <p className="text-xs text-muted-foreground">Size: {formatFileSize(image.size)}</p>
                            <p className="text-xs text-muted-foreground">Uploaded: {format(new Date(image.createdAt), 'MMM d, yyyy')}</p>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => copyToClipboard(String(image.id), 'ID')}>
                                <Copy className="mr-2 h-4 w-4" /> ID
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => copyFullUrl(image.id)}>
                                <LinkIcon className="mr-2 h-4 w-4" /> URL
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon" className="shrink-0">
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the image "{image.filename || `ID ${image.id}`}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(image.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Preview</TableHead>
                                <TableHead>Filename</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Uploaded</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedImages.map(image => (
                                <TableRow key={image.id}>
                                    <TableCell>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <div className="w-16 h-16 bg-muted rounded-md overflow-hidden cursor-pointer">
                                            <img src={`/api/images/${image.id}`} alt={image.filename || ''} className="h-full w-full object-cover"/>
                                          </div>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl p-2 bg-transparent border-none shadow-none">
                                            <DialogHeader>
                                              <RDialogTitle className="sr-only">Image Preview: {image.filename || `Image ${image.id}`}</RDialogTitle>
                                            </DialogHeader>
                                            <img src={`/api/images/${image.id}`} alt={image.filename || ''} className="max-h-[90vh] w-auto h-auto rounded-lg mx-auto" />
                                        </DialogContent>
                                      </Dialog>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium truncate" title={image.filename || ''}>{image.filename || 'Untitled'}</p>
                                        <p className="text-xs text-muted-foreground">ID: {image.id}</p>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{image.mimeType || 'N/A'}</TableCell>
                                    <TableCell className="text-muted-foreground">{formatFileSize(image.size)}</TableCell>
                                    <TableCell className="text-muted-foreground">{format(new Date(image.createdAt), 'yyyy-MM-dd')}</TableCell>
                                    <TableCell className="text-right">
                                         <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(String(image.id), 'ID')}><Copy className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" onClick={() => copyFullUrl(image.id)}><LinkIcon className="h-4 w-4"/></Button>
                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                  <AlertDialogDescription>This will permanently delete "{image.filename || `ID ${image.id}`}".</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                  <AlertDialogAction onClick={() => handleDelete(image.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            {renderPagination()}
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <FileImage className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold">
              {searchTerm ? 'No images found' : 'Your library is empty'}
            </h3>
            <p>
              {searchTerm ? 'Try a different search term.' : 'Click "Upload File" to add your first image.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
