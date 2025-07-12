"use client";

import { useState, useEffect, useRef } from "react";
import type { HeroSectionData, Language, HeroFeature } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Save,
  Upload,
  Loader2,
  Image as ImageIcon,
  PlusCircle,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logAction } from "@/lib/logger";
import { getHeroData, updateHeroData } from "@/lib/db/actions";
import NextImage from "next/image";
import { initialData } from "@/lib/data";
import { AdvantageIcon } from "@/components/AdvantageIcon";
import { Separator } from "@/components/ui/separator";

type AllHeroData = Record<Language, HeroSectionData>;

const languageNames: Record<Language, string> = {
  en: "English",
  uk: "Ukrainian",
  sk: "Slovak",
};

const LanguageFlag = ({ lang }: { lang: Language }) => {
  const flags: Record<Language, string> = { en: "🇬🇧", uk: "🇺🇦", sk: "🇸🇰" };
  return (
    <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`}>
      {flags[lang]}
    </span>
  );
};

const createDefaultHeroData = (lang: Language): HeroSectionData => ({
  id: 0,
  title: `Title for ${languageNames[lang]}`,
  subtitle: `Subtitle for ${languageNames[lang]}`,
  imageId: null,
  features: initialData.heroFeaturesData[lang].map((f, i) => ({ ...f, id: i + 1 })),
});

export default function HeroSectionAdminPage() {
  const { toast } = useToast();

  const [allData, setAllData] = useState<AllHeroData | null>(null);
  const [selectedLang, setSelectedLang] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const data = allData?.[selectedLang] ?? null;

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const langs: Language[] = ["en", "uk", "sk"];
      const results = await Promise.all(langs.map(getHeroData));
      const merged = langs.reduce((acc, lang, i) => {
        acc[lang] = results[i] || createDefaultHeroData(lang);
        return acc;
      }, {} as AllHeroData);
      setAllData(merged);
      setIsLoading(false);
    })();
  }, []);

  const handleChange = (field: keyof HeroSectionData, value: any) => {
    setAllData((prev) =>
      prev
        ? {
            ...prev,
            [selectedLang]: { ...prev[selectedLang], [field]: value },
          }
        : prev
    );
  };
  
  const handleFeatureChange = (id: number, field: keyof HeroFeature, value: string) => {
      if (!data) return;
      const updatedFeatures = data.features.map(f => f.id === id ? {...f, [field]: value} : f);
      handleChange('features', updatedFeatures);
  }
  
  const handleAddFeature = () => {
      if (!data) return;
      const newFeature = { id: Date.now(), text: 'New Feature', icon: 'CheckCircle' };
      handleChange('features', [...data.features, newFeature]);
  }
  
  const handleDeleteFeature = (id: number) => {
      if (!data) return;
      handleChange('features', data.features.filter(f => f.id !== id));
  }


  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Upload failed");
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || "Upload failed");
      }

      handleChange("imageId", json.id);
      
      toast({
        title: "Image uploaded",
        description: "Click “Save Changes” to persist.",
      });
      logAction("File Upload", "Success", `Uploaded hero image ID: ${json.id}`);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Upload failed",
        description: err.message ?? "Unknown error",
        variant: "destructive",
      });
      logAction("File Upload", "Failure", err.message ?? "Unknown error");
    } finally {
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      await updateHeroData(selectedLang, data);
      toast({
        title: "Saved!",
        description: `Hero section (${languageNames[selectedLang]}) updated.`,
      });
      logAction("Hero Update", "Success", `Saved hero for ${selectedLang}`);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Save failed",
        description: err.message ?? "Internal error",
        variant: "destructive",
      });
      logAction("Hero Update", "Failure", err.message ?? "Internal error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="opacity-0 animate-fade-in-up">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Manage Hero Section</CardTitle>
            <CardDescription>
              Edit the content for the homepage hero.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedLang}
              onValueChange={(v) => setSelectedLang(v as Language)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue>
                  <LanguageFlag lang={selectedLang} />
                  {languageNames[selectedLang]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(["en", "uk", "sk"] as Language[]).map((l) => (
                  <SelectItem key={l} value={l}>
                    <LanguageFlag lang={l} /> {languageNames[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
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
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                rows={3}
                value={data.subtitle}
                onChange={(e) => handleChange("subtitle", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Background Image</Label>
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-4">
                  {data.imageId ? (
                    <div className="relative w-full overflow-hidden rounded-md aspect-video">
                      <NextImage
                        key={data.imageId}
                        src={`/api/images/${data.imageId}`}
                        alt="Hero background"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div className="flex w-full items-center justify-center rounded-md bg-muted aspect-video">
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Image
                  </Button>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </CardContent>
              </Card>
            </div>
            
            <Separator />

            <div>
              <Label className="text-lg font-semibold">Features</Label>
              <p className="text-sm text-muted-foreground mb-4">Manage the list of features shown in the hero section.</p>
              <div className="space-y-4">
                {data.features.map(feature => (
                  <div key={feature.id} className="flex items-center gap-2 p-2 border rounded-md">
                    <AdvantageIcon name={feature.icon} className="h-5 w-5 text-muted-foreground"/>
                    <Input
                      value={feature.icon}
                      onChange={(e) => handleFeatureChange(feature.id, 'icon', e.target.value)}
                      placeholder="Icon Name"
                      className="w-32"
                    />
                    <Input
                      value={feature.text}
                      onChange={(e) => handleFeatureChange(feature.id, 'text', e.target.value)}
                      placeholder="Feature Text"
                      className="flex-grow"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteFeature(feature.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={handleAddFeature}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Feature
                </Button>
              </div>
            </div>
             <div className="text-sm text-muted-foreground p-4 border-dashed border-2 rounded-md">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4"/>Icon Tip</h4>
                <p>Enter the name of a `lucide-react` icon (e.g., `CheckCircle`, `ShieldCheck`). The icon preview will update automatically. Case matters!</p>
            </div>

            <p className="pt-4 text-sm text-muted-foreground">
              Note: The call-to-action button text lives in
              <code className="ml-1 font-mono">src/lib/translations.ts</code>.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
