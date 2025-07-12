
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
import { getImages, deleteImage } from '@/lib/db/actions'
import { logAction } from '@/lib/logger'
import { format } from 'date-fns'

type ImageInfo = {
  id: number
  filename: string | null
  mimeType: string | null
  createdAt: Date
}

export default function UploadsAdminPage() {
  const { toast } = useToast()
  const [images, setImages] = useState<ImageInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ description: `Copied "${text}" to clipboard.` })
  }

  return (
    <Card className="opacity-0 animate-fade-in-up">
      <CardHeader>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <CardTitle>Manage Uploads</CardTitle>
            <CardDescription>
              Browse, upload, and delete images from your site's library.
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
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                <img
                  src={`/api/images/${image.id}`}
                  alt={image.filename || `Image ${image.id}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p
                    className="text-white text-xs font-semibold truncate"
                    title={image.filename || ''}
                  >
                    {image.filename || 'Untitled'}
                  </p>
                  <p className="text-white/80 text-xs">
                    {format(new Date(image.createdAt), 'MMM d, yyyy')}
                  </p>
                  <div className="flex gap-1 mt-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyToClipboard(String(image.id))}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the image "
                            {image.filename || `ID ${image.id}`}". This action cannot
                            be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(image.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <FileImage className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-semibold">Your library is empty</h3>
            <p>Click "Upload File" to add your first image.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
