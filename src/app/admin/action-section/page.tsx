'use client'

import { useState, useEffect, useRef } from 'react'
import type { ActionSectionData, Language } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Save,
  Upload,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { logAction } from '@/lib/logger'
import {
  getActionSectionData,
  updateActionSectionData,
} from '@/lib/db/actions'

const LanguageFlag = ({ lang }: { lang: Language }) => {
  const flags: Record<string, string> = {
    en: '🇬🇧',
    uk: '🇺🇦',
    sk: '🇸🇰',
  }
  return (
    <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`}>
      {flags[lang]}
    </span>
  )
}

const languageNames: Record<Language, string> = {
  en: 'English',
  uk: 'Ukrainian',
  sk: 'Slovak',
}

const createDefaultActionSectionData = (lang: Language): ActionSectionData => ({
  id: 0,
  title: `Title for ${languageNames[lang]}`,
  subtitle: `Subtitle for ${languageNames[lang]}`,
  description: '',
  visible: true,
  buttonText: 'Learn More',
  buttonUrl: '#',
  buttonVisible: true,
})

export default function ActionSectionAdminPage() {
  const { toast } = useToast()
  const [allData, setAllData] = useState<Record<Language, ActionSectionData> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedLang, setSelectedLang] = useState<Language>('en')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const data = allData?.[selectedLang] ?? null

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true)
      const languages: Language[] = ['en', 'uk', 'sk']
      const promises = languages.map((lang) => getActionSectionData(lang))
      const results = await Promise.all(promises)

      const newAllData = languages.reduce((acc, lang, index) => {
        acc[lang] = results[index] || createDefaultActionSectionData(lang)
        return acc
      }, {} as Record<Language, ActionSectionData>)

      setAllData(newAllData)
      setIsLoading(false)
    }
    loadAllData()
  }, [])

  const updateLocalData = (updates: Partial<ActionSectionData>) => {
    setAllData((prev) => {
      if (!prev) return null
      return {
        ...prev,
        [selectedLang]: {
          ...prev[selectedLang],
          ...updates,
        },
      }
    })
  }

  const handleSave = async () => {
    const current = allData?.[selectedLang]
    if (!current) return

    setIsSaving(true)
    console.log('Saving data:', current)

    try {
      await updateActionSectionData(selectedLang, current)
      toast({
        title: 'Saved!',
        description: `Changes to the "In Action" section for ${languageNames[selectedLang]} have been saved.`,
      })
      logAction(
        'Action Section Update',
        'Success',
        `Saved all changes for ${languageNames[selectedLang]} 'In Action' section.`
      )
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: 'Save Failed',
        description: 'An error occurred during save.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    toast({
      title: 'Uploading...',
      description: 'Please wait while the image is uploaded.',
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        updateLocalData({ imageId: result.id })
        toast({
          title: 'Image Uploaded',
          description: 'Image has been updated. Remember to save your changes.',
        })
      } else {
        toast({
          title: 'Upload Failed',
          description: result.error || 'Could not upload image.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Image upload error:', error)
      toast({
        title: 'Upload Failed',
        description: 'An error occurred during upload.',
        variant: 'destructive',
      })
    } finally {
      if (event.target) event.target.value = ''
    }
  }

  return (
    <Card className="opacity-0 animate-fade-in-up">
      <CardHeader>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <CardTitle>Manage "In Action" Section</CardTitle>
            <CardDescription>
              Edit the content for the "See Spekulus in Action" section on the homepage.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedLang} onValueChange={(value) => setSelectedLang(value as Language)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue>
                  <div className="flex items-center">
                    <LanguageFlag lang={selectedLang} />
                    {languageNames[selectedLang]}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en"><LanguageFlag lang="en" /> English</SelectItem>
                <SelectItem value="uk"><LanguageFlag lang="uk" /> Ukrainian</SelectItem>
                <SelectItem value="sk"><LanguageFlag lang="sk" /> Slovak</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading || !data ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="visible" className="text-base">Section Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  {data.visible ? 'This section is currently visible.' : 'This section is hidden.'}
                </p>
              </div>
              <Switch
                id="visible"
                checked={data.visible}
                onCheckedChange={(checked) => updateLocalData({ visible: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Section Title</Label>
              <Input id="title" value={data.title} onChange={(e) => updateLocalData({ title: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Section Subtitle</Label>
              <Input id="subtitle" value={data.subtitle} onChange={(e) => updateLocalData({ subtitle: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={data.description} onChange={(e) => updateLocalData({ description: e.target.value })} rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <Card>
                <CardContent className="p-4 flex flex-col items-center gap-4">
                  {data.imageId ? (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden">
                      <img
                        src={`/api/images/${data.imageId}`}
                        alt="Action image"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            <h3 className="text-lg font-medium text-foreground">Button Settings</h3>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="buttonVisible" className="text-base">Button Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  {data.buttonVisible ? 'Button is visible.' : 'Button is hidden.'}
                </p>
              </div>
              <Switch
                id="buttonVisible"
                checked={data.buttonVisible}
                onCheckedChange={(checked) => updateLocalData({ buttonVisible: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text</Label>
              <Input id="buttonText" value={data.buttonText} onChange={(e) => updateLocalData({ buttonText: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonUrl">Button URL</Label>
              <Input id="buttonUrl" value={data.buttonUrl} onChange={(e) => updateLocalData({ buttonUrl: e.target.value })} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
