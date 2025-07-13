
'use client';

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
import { Handshake, Loader2 } from 'lucide-react';
import { createCooperationRequest } from '@/lib/db/actions';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  message: z.string().min(20, { message: "Message must be at least 20 characters." }).max(1000, { message: "Message cannot exceed 1000 characters." }),
});

export function CooperationSection() {
  const { translations } = useLanguage();
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
    <section id="cooperation" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="opacity-0 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4 text-primary">
                <Handshake className="w-8 h-8"/>
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Cooperate With Us</h2>
            </div>
            <p className="text-lg text-foreground/80 mb-6">
                We are actively seeking strategic partners, investors, and collaborators who share our vision for the future of smart living. If you're interested in helping us scale, innovate, and bring Spekulus to a global market, we'd love to hear from you.
            </p>
            <p className="text-foreground/80">
                Please use the form to detail your proposal, and our founders will get back to you as soon as possible.
            </p>
        </div>

        <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 rounded-lg border border-border/50 shadow-xl">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name / Company</FormLabel>
                    <FormControl><Input placeholder="Your full name or company name" {...field} /></FormControl>
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl><Input type="tel" placeholder="+1 (555) 123-4567" {...field} /></FormControl>
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
                    <FormLabel>Cooperation Proposal</FormLabel>
                    <FormControl><Textarea placeholder="Please describe your interest or proposal..." className="resize-y" rows={5} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg h-12" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Proposal"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
