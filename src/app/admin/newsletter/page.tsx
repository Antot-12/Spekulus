
'use client'

import { useState, useEffect } from 'react'
import type { NewsletterSectionData, Language } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Save, Loader2, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { logAction } from '@/lib/logger'
import { getNewsletterSectionData, updateNewsletterSectionData } from '@/lib/db/actions'
import { initialData } from '@/lib/data'

const LanguageFlag = ({ lang }: { lang: Language }) => {
  const flags: Record<string, string> = { en: '🇬🇧', uk: '🇺🇦', sk: '🇸🇰' }
  return <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`} />
}

const languageNames: Record<Language, string> = {
  en: 'English',
  uk: 'Ukrainian',
  sk: 'Slovak',
}

export default function NewsletterAdminPage() {
  const { toast } = useToast()
  const [allData, setAllData] = useState<Record<Language, NewsletterSectionData> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedLang, setSelectedLang] = useState<Language>('en')

  const data = allData?.[selectedLang] ?? null

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true)
      const languages: Language[] = ['en', 'uk', 'sk']
      const promises = languages.map(lang => getNewsletterSectionData(lang))
      const results = await Promise.all(promises)

      const newAllData = languages.reduce((acc, lang, index) => {
        acc[lang] = results[index] || initialData.newsletterSectionData[lang] as NewsletterSectionData;
        return acc
      }, {} as Record<Language, NewsletterSectionData>)

      setAllData(newAllData)
      setIsLoading(false)
    }
    loadAllData()
  }, [])

  const updateLocalData = (updates: Partial<NewsletterSectionData>) => {
    setAllData(prev => {
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
    if (!data) return

    setIsSaving(true)
    try {
      await updateNewsletterSectionData(selectedLang, data)
      toast({
        title: 'Saved!',
        description: `Newsletter section for ${languageNames[selectedLang]} has been updated.`,
      })
      logAction('Newsletter Update', 'Success', `Saved changes for ${languageNames[selectedLang]} newsletter section.`)
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'An error occurred during save.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="opacity-0 animate-fade-in-up">
      <CardHeader>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2"><Mail /> Manage Newsletter Section</CardTitle>
            <CardDescription>
              Edit the text for the "Stay in the Loop" section on the homepage.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedLang} onValueChange={value => setSelectedLang(value as Language)}>
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
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Section Title</Label>
              <Input id="title" value={data.title} onChange={e => updateLocalData({ title: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Section Subtitle</Label>
              <Input id="subtitle" value={data.subtitle} onChange={e => updateLocalData({ subtitle: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text</Label>
              <Input id="buttonText" value={data.buttonText} onChange={e => updateLocalData({ buttonText: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacy_notice">Privacy Notice</Label>
              <Input id="privacy_notice" value={data.privacy_notice} onChange={e => updateLocalData({ privacy_notice: e.target.value })} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
