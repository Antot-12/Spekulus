
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Copy, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(500, { message: "Message cannot exceed 500 characters." }),
});

export function ContactSection() {
  const { translations } = useLanguage();
  const { toast } = useToast();
  const emailAddress = "spekulus.mirror@gmail.com";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Message Sent!",
          description: "Thank you for your feedback. We'll be in touch shortly.",
        });
        form.reset();
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Something went wrong. Please try again.",
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not connect to the server. Please check your connection.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(emailAddress);
    toast({
      title: "Email Copied!",
      description: `${emailAddress} has been copied to your clipboard.`,
    });
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{translations.contact.title}</h2>
          <p className="text-lg text-foreground/70 mt-2">{translations.contact.subtitle}</p>
        </div>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start opacity-0 animate-fade-in-up" style={{animationDelay: '300ms'}}>
            <div className="space-y-8">
                <Card className="bg-card border-border/50 shadow-lg p-6 text-center md:text-left">
                     <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-3 inline-block">
                           <Mail className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold font-headline">{translations.contact.emailTitle}</h3>
                        <p className="text-foreground/80">{translations.contact.emailDesc}</p>
                        <div className="flex items-center gap-2 bg-muted p-3 rounded-lg w-full justify-between">
                            <a href={`mailto:${emailAddress}`} className="font-mono text-primary hover:underline truncate">
                                {emailAddress}
                            </a>
                            <Button variant="ghost" size="icon" onClick={copyEmailToClipboard} aria-label="Copy email address">
                                <Copy className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="bg-card border-border/50 shadow-lg">
                 <CardHeader>
                    <CardTitle className="font-headline text-3xl">{translations.contact.formTitle}</CardTitle>
                    <CardDescription>{translations.contact.formDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{translations.contact.nameLabel}</FormLabel>
                              <FormControl>
                                <Input placeholder={translations.contact.namePlaceholder} {...field} disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{translations.contact.emailLabel}</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder={translations.contact.emailPlaceholder} {...field} disabled={isSubmitting} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{translations.contact.messageLabel}</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={translations.contact.messagePlaceholder}
                                  className="resize-none"
                                  rows={5}
                                  {...field}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage className="text-base" />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                           {isSubmitting ? translations.contact.submitButtonSending : translations.contact.submitButton}
                           {isSubmitting ? (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </div>
    </section>
  );
}
