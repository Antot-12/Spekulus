
'use client'

import { useState, useEffect } from 'react'
import type { CooperationSectionData, Language } from '@/lib/data'
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
import { Save, Loader2, Handshake } from 'lucide-react'
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
import { getCooperationSectionData, updateCooperationSectionData } from '@/lib/db/actions'
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

export default function CooperationSectionAdminPage() {
  const { toast } = useToast()
  const [allData, setAllData] = useState<Record<Language, CooperationSectionData> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedLang, setSelectedLang] = useState<Language>('en')
  const [actor, setActor] = useState('admin');

  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user') || 'admin';
    setActor(adminUser);
  }, []);

  const data = allData?.[selectedLang] ?? null

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true)
      const languages: Language[] = ['en', 'uk', 'sk']
      const promises = languages.map(lang => getCooperationSectionData(lang))
      const results = await Promise.all(promises)

      const newAllData = languages.reduce((acc, lang, index) => {
        acc[lang] = results[index] || initialData.cooperationSectionData[lang] as CooperationSectionData;
        return acc
      }, {} as Record<Language, CooperationSectionData>)

      setAllData(newAllData)
      setIsLoading(false)
    }
    loadAllData()
  }, [])

  const updateLocalData = (updates: Partial<CooperationSectionData>) => {
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
      await updateCooperationSectionData(selectedLang, data, actor)
      toast({
        title: 'Saved!',
        description: `Cooperation section for ${languageNames[selectedLang]} has been updated.`,
      })
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
            <CardTitle className="flex items-center gap-2"><Handshake /> Manage Cooperation Section</CardTitle>
            <CardDescription>
              Edit the text content for the "Cooperate With Us" section.
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
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={data.title} onChange={e => updateLocalData({ title: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={data.description} onChange={e => updateLocalData({ description: e.target.value })} rows={4} />
            </div>
            
            <h3 className="text-lg font-semibold pt-4 border-t">Form Fields</h3>
            
            <div className="space-y-2">
              <Label htmlFor="form_title">Form Title</Label>
              <Input id="form_title" value={data.form_title} onChange={e => updateLocalData({ form_title: e.target.value })} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name_label">Name Label</Label>
                <Input id="name_label" value={data.name_label} onChange={e => updateLocalData({ name_label: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_placeholder">Name Placeholder</Label>
                <Input id="name_placeholder" value={data.name_placeholder} onChange={e => updateLocalData({ name_placeholder: e.target.value })} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email_label">Email Label</Label>
                <Input id="email_label" value={data.email_label} onChange={e => updateLocalData({ email_label: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_placeholder">Email Placeholder</Label>
                <Input id="email_placeholder" value={data.email_placeholder} onChange={e => updateLocalData({ email_placeholder: e.target.value })} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone_label">Phone Label</Label>
                    <Input id="phone_label" value={data.phone_label} onChange={e => updateLocalData({ phone_label: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone_placeholder">Phone Placeholder</Label>
                    <Input id="phone_placeholder" value={data.phone_placeholder} onChange={e => updateLocalData({ phone_placeholder: e.target.value })} />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="proposal_label">Proposal Label</Label>
                    <Input id="proposal_label" value={data.proposal_label} onChange={e => updateLocalData({ proposal_label: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="proposal_placeholder">Proposal Placeholder</Label>
                    <Input id="proposal_placeholder" value={data.proposal_placeholder} onChange={e => updateLocalData({ proposal_placeholder: e.target.value })} />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="submit_button_text">Submit Button Text</Label>
              <Input id="submit_button_text" value={data.submit_button_text} onChange={e => updateLocalData({ submit_button_text: e.target.value })} />
            </div>

          </>
        )}
      </CardContent>
    </Card>
  )
}
