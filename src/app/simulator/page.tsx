"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Loader2, Send, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { simulateMirror } from '@/ai/flows/mirror-simulator-flow';
import { useLanguage } from '@/contexts/LanguageContext';

type Message = {
    speaker: 'user' | 'ai';
    text: string;
};

export default function SimulatorPage() {
    const { toast } = useToast();
    const { translations } = useLanguage();
    const [input, setInput] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { speaker: 'ai', text: "Hello! I'm Spekulus, your smart mirror assistant. How can I help you today? Try asking about the weather or my schedule." }
    ]);
    
    const suggestedPrompts = [
        "What's on my schedule today?",
        "What's the weather like?",
        "Give me a motivational quote.",
        "Tell me the latest tech news."
    ];

    const handleSubmit = async (prompt: string) => {
        if (!prompt.trim()) return;

        setMessages(prev => [...prev, { speaker: 'user', text: prompt }]);
        setInput('');
        setIsAsking(true);

        try {
            const result = await simulateMirror(prompt);
            setMessages(prev => [...prev, { speaker: 'ai', text: result.response }]);
        } catch (error) {
            console.error("Simulator AI error:", error);
            toast({
                title: "AI Error",
                description: "The AI assistant is currently unavailable.",
                variant: "destructive",
            });
        } finally {
            setIsAsking(false);
        }
    };
    
    return (
        <div className="container mx-auto max-w-3xl px-4 py-12 md:py-20">
            <Card className="opacity-0 animate-fade-in-up">
                <CardHeader className="text-center">
                    <div className="inline-block mx-auto bg-primary/10 p-3 rounded-lg mb-4">
                        <Bot className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl md:text-4xl">Spekulus AI Simulator</CardTitle>
                    <CardDescription className="text-lg">
                        Interact with a virtual Spekulus mirror. Ask it anything!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="h-96 overflow-y-auto p-4 border rounded-md bg-muted/30 space-y-4 flex flex-col">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.speaker === 'ai' && (
                                    <div className="bg-primary text-primary-foreground rounded-full p-2">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                )}
                                <div className={`max-w-sm rounded-lg px-4 py-2 ${msg.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-base">{msg.text}</p>
                                </div>
                                {msg.speaker === 'user' && (
                                    <div className="bg-muted text-foreground rounded-full p-2">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isAsking && (
                            <div className="flex items-start gap-3 justify-start animate-pulse">
                                <div className="bg-primary text-primary-foreground rounded-full p-2">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="max-w-sm rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-foreground/80 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Suggestions
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {suggestedPrompts.map(prompt => (
                                <Button key={prompt} variant="outline" size="sm" onClick={() => handleSubmit(prompt)} disabled={isAsking}>
                                    {prompt}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(input); }} className="flex items-center gap-2">
                        <Input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Spekulus something..."
                            disabled={isAsking}
                            autoFocus
                        />
                        <Button type="submit" disabled={isAsking || !input.trim()}>
                            {isAsking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5"/>}
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
