
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Handshake, Loader2 } from 'lucide-react';
import { createCooperationRequest } from '@/lib/db/actions';
import type { CooperationSectionData } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  message: z.string().min(20, { message: "Message must be at least 20 characters." }).max(1000, { message: "Message cannot exceed 1000 characters." }),
});

export function CooperationSection({ data }: { data: CooperationSectionData }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await createCooperationRequest(values);
      if (result) {
        toast({
          title: "Request Sent!",
          description: "Thank you for your interest. We'll be in touch with you shortly.",
        });
        form.reset();
      } else {
        throw new Error("Failed to create request.");
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again later.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="cooperation" className="py-16 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="opacity-0 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4 text-primary">
                <Handshake className="w-8 h-8"/>
                <h2 className="text-3xl md:text-4xl font-bold font-headline">{data.title}</h2>
            </div>
            <p className="text-lg text-foreground/80 mb-6">
                {data.description}
            </p>
        </div>

        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 rounded-lg border border-border/50 shadow-xl">
              <h3 className="text-2xl font-bold font-headline text-center">{data.form_title}</h3>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{data.name_label}</FormLabel>
                    <FormControl><Input placeholder={data.name_placeholder} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{data.email_label}</FormLabel>
                      <FormControl><Input type="email" placeholder={data.email_placeholder} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{data.phone_label}</FormLabel>
                      <FormControl><Input type="tel" placeholder={data.phone_placeholder} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{data.proposal_label}</FormLabel>
                    <FormControl><Textarea placeholder={data.proposal_placeholder} className="resize-y" rows={5} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : data.submit_button_text}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
