
"use client";

import * as React from 'react';
import { Bold, Italic, Strikethrough, Heading, Quote, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, Code, Minus, FileUp } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useToast } from '@/hooks/use-toast';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
};

const UnderlineIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 4v6a6 6 0 0 0 12 0V4"/><path d="M4 20h16"/></svg>
);

export function MarkdownEditor({ value, onChange, rows = 12 }: MarkdownEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const applyFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = `${before}${selectedText}${after}`;
    
    const updatedValue = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end);
    
    onChange(updatedValue);

    setTimeout(() => {
        textarea.focus();
        if (selectedText) {
            textarea.selectionStart = start + before.length;
            textarea.selectionEnd = start + before.length + selectedText.length;
        } else {
            textarea.selectionStart = textarea.selectionEnd = start + before.length;
        }
    }, 0);
  };

  const insertLink = () => {
    const url = prompt("Enter the URL:", "https://");
    if (url) {
        applyFormatting(`[`, `](${url})`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    toast({ title: "Uploading...", description: "Please wait while the file is uploaded." });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.id) {
        const imageUrl = `/api/images/${result.id}`;
        if (isImage) {
            applyFormatting(`\n![${file.name}](${imageUrl})\n`);
        } else {
            applyFormatting(`[Download ${file.name}](${imageUrl})`);
        }
        toast({ title: "Upload Complete", description: "File successfully added to content." });
      } else {
        toast({ title: "Upload Failed", description: result.error || "Could not upload file.", variant: 'destructive' });
      }
    } catch (error) {
        console.error("File upload error:", error);
        toast({ title: "Upload Failed", description: "An error occurred during upload.", variant: 'destructive' });
    } finally {
        if (event.target) {
            event.target.value = '';
        }
    }
  };

  const triggerImageUpload = () => imageInputRef.current?.click();
  const triggerFileUpload = () => fileInputRef.current?.click();

  const insertList = (type: 'ul' | 'ol') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const lines = selectedText.split('\n');
    
    const prefix = type === 'ul' ? '- ' : '1. ';
    const isAlreadyList = lines.every(line => line.trim().startsWith(prefix.trim()));

    let newText;
    if (isAlreadyList) {
        newText = lines.map(line => line.replace(new RegExp(`^(${prefix.trim()}|\\d+\\.\\s)`), '')).join('\n');
    } else {
        newText = lines.map((line, index) => {
            if (line.trim() === '') return line;
            return type === 'ul' ? `${prefix}${line}` : `${index + 1}. ${line}`;
        }).join('\n');
    }

    const updatedValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    onChange(updatedValue);

    setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = start;
        textarea.selectionEnd = start + newText.length;
    }, 0);
  };


  const toolbarButtons = [
    { icon: Bold, action: () => applyFormatting('**', '**'), tooltip: 'Bold' },
    { icon: Italic, action: () => applyFormatting('*', '*'), tooltip: 'Italic' },
    { icon: Strikethrough, action: () => applyFormatting('~~', '~~'), tooltip: 'Strikethrough' },
    { icon: UnderlineIcon, action: () => applyFormatting('<u>', '</u>'), tooltip: 'Underline' },
    { isSeparator: true },
    { icon: Heading, action: () => applyFormatting('\n### ', '\n'), tooltip: 'Heading 3' },
    { icon: Quote, action: () => applyFormatting('\n> ', '\n'), tooltip: 'Blockquote' },
    { icon: Code, action: () => applyFormatting('`', '`'), tooltip: 'Code' },
    { isSeparator: true },
    { icon: LinkIcon, action: insertLink, tooltip: 'Insert Link' },
    { icon: ImageIcon, action: triggerImageUpload, tooltip: 'Upload Image' },
    { icon: FileUp, action: triggerFileUpload, tooltip: 'Upload Attachment' },
    { isSeparator: true },
    { icon: List, action: () => insertList('ul'), tooltip: 'Unordered List' },
    { icon: ListOrdered, action: () => insertList('ol'), tooltip: 'Ordered List' },
    { icon: Minus, action: () => applyFormatting('\n---\n'), tooltip: 'Horizontal Rule' },
  ];

  return (
    <div className="border rounded-md bg-background">
        <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => handleFileUpload(e, true)}
            accept="image/*"
            className="hidden"
        />
        <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e, false)}
            className="hidden"
        />
        <Tabs defaultValue="write" className="w-full">
            <div className="p-1 border-b flex flex-wrap items-center justify-between gap-2 bg-background/95">
                <TabsList className="bg-transparent p-0">
                    <TabsTrigger value="write" className="data-[state=active]:bg-muted">Write</TabsTrigger>
                    <TabsTrigger value="preview" className="data-[state=active]:bg-muted">Preview</TabsTrigger>
                </TabsList>
                <TooltipProvider>
                    <div className="flex flex-wrap items-center gap-1">
                        {toolbarButtons.map((btn, index) =>
                        btn.isSeparator ? (
                            <Separator key={`sep-${index}`} orientation="vertical" className="h-8" />
                        ) : (
                            <Tooltip key={btn.tooltip}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={btn.action}
                                        className="h-8 w-8"
                                        type="button"
                                    >
                                        <btn.icon className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{btn.tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        )
                        )}
                    </div>
                </TooltipProvider>
            </div>
            <TabsContent value="write">
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={rows}
                    className="border-0 rounded-t-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 leading-relaxed resize-y"
                    placeholder="Write your article here... Markdown and some HTML are supported!"
                />
            </TabsContent>
            <TabsContent value="preview">
                <div 
                    className="p-4 prose prose-lg dark:prose-invert max-w-none"
                    style={{minHeight: `${rows * 1.75}rem`}}
                >
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            img: ({node, ...props}) => {
                              if (!props.src) return null;
                              // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                              return <img {...props} className="rounded-lg shadow-md mx-auto" style={{maxWidth: '100%'}} />;
                            },
                        }}
                    >
                        {value || <span className="text-muted-foreground">Preview will appear here...</span>}
                    </ReactMarkdown>
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
