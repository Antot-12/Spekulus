
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';
import { subscribeToNewsletter } from '@/lib/db/actions';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export function NewsletterSection() {
  const { translations } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await subscribeToNewsletter(values.email);

      if (result.success) {
        toast({
          title: "Subscribed!",
          description: "Thank you for subscribing to our newsletter.",
        });
        form.reset();
      } else {
        toast({
          title: "Subscription Failed",
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

  return (
    <section id="newsletter" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 text-primary p-3 rounded-full mb-4">
                <Mail className="w-8 h-8"/>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Stay in the Loop</h2>
            <p className="text-lg text-foreground/70 mt-2 mb-8">
                Subscribe to our newsletter to receive the latest news, updates, and special offers from the Spekulus team.
            </p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4 max-w-lg mx-auto">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="w-full">
                        <FormControl>
                            <Input 
                                type="email" 
                                placeholder="Enter your email..." 
                                {...field} 
                                disabled={isSubmitting} 
                                className="h-12 text-base"
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full sm:w-auto h-12 text-base" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        "Subscribe"
                    )}
                    </Button>
                </form>
            </Form>
            <p className="text-xs text-muted-foreground mt-4">We respect your privacy. No spam, ever.</p>
        </div>
      </div>
    </section>
  );
}
