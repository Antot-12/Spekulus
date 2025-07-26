
'use client'

import { useState, useEffect, useCallback } from 'react'
import type { FaqItem, Language } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Trash2, PlusCircle, Save, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarkdownEditor } from '@/components/ui/markdown-editor'
import { getFaqs, updateFaqs, createFaq } from '@/lib/db/actions'

const LanguageFlag = ({ lang }: { lang: Language }) => {
  const flags: Record<string, string> = { en: '🇬🇧', uk: '🇺🇦', sk: '🇸🇰' }
  return <span className="mr-2">{flags[lang]}</span>
}

const languageNames: Record<Language, string> = { en: 'English', uk: 'Ukrainian', sk: 'Slovak' }

export default function FaqAdminPage() {
  const { toast } = useToast()
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedLang, setSelectedLang] = useState<Language>('en')
  const [actor, setActor] = useState('admin');

  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user') || 'admin';
    setActor(adminUser);
  }, []);

  const fetchFaqs = useCallback(async (lang: Language) => {
    setIsLoading(true)
    try {
      const data = await getFaqs(lang)
      setFaqs(data || [])
    } catch {
      toast({ title: 'Network Error', description: 'Failed to connect to the server.', variant: 'destructive' })
    }
    setIsLoading(false)
  }, [toast])

  useEffect(() => {
    fetchFaqs(selectedLang)
  }, [selectedLang, fetchFaqs])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const cleaned = faqs.map(f => ({ ...f, id: Number(f.id) }))
      await updateFaqs(selectedLang, cleaned, actor)
      toast({ title: 'Saved!', description: `All FAQ changes for ${languageNames[selectedLang]} saved.` })
    } catch {
      toast({ title: 'Save Failed', description: 'Could not save changes.', variant: 'destructive' })
    }
    setIsSaving(false)
  }

  const handleChange = (id: number, field: 'question' | 'answer', value: string) => {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  const handleAdd = async () => {
    try {
      const newFaq = await createFaq(selectedLang, { question: 'New Question?', answer: 'New Answer.' }, actor)
      if (newFaq) {
        setFaqs(prev => [...prev, newFaq])
        toast({ title: 'FAQ Added', description: 'Remember to save.' })
      }
    } catch {
      toast({ title: 'Add Failed', description: 'Could not add FAQ.', variant: 'destructive' })
    }
  }

  const handleDelete = (id: number) => {
    setFaqs(prev => prev.filter(f => f.id !== id))
    toast({ title: 'FAQ Deleted', description: 'Remember to save.', variant: 'destructive' })
  }

  return (
    <Card className="opacity-0 animate-fade-in-up">
      <CardHeader>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <CardTitle>Manage FAQ</CardTitle>
            <CardDescription>Edit questions and answers for each language.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedLang} onValueChange={v => setSelectedLang(v as Language)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue>
                  <div className="flex items-center">
                    <LanguageFlag lang={selectedLang} />
                    {languageNames[selectedLang]}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en"><LanguageFlag lang="en" />{languageNames.en}</SelectItem>
                <SelectItem value="uk"><LanguageFlag lang="uk" />{languageNames.uk}</SelectItem>
                <SelectItem value="sk"><LanguageFlag lang="sk" />{languageNames.sk}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4" />Add</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2 p-4 border rounded-md">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : faqs.length > 0 ? (
          faqs.map(faq => (
            <div key={faq.id} className="space-y-2 p-4 border rounded-md">
              <Input value={faq.question} onChange={e => handleChange(faq.id, 'question', e.target.value)} className="font-bold" />
              <MarkdownEditor value={faq.answer} onChange={v => handleChange(faq.id, 'answer', v)} rows={5} />
              <div className="flex justify-end pt-2">
                <Button variant="destructive" size="icon" onClick={() => handleDelete(faq.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>No FAQs for this language.</p>
            <p>Click "Add" to create the first one.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
