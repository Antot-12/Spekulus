import { Github, Linkedin, Facebook, Mail, Heart, KeyRound } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { translations } = useLanguage();

  return (
    <footer id="page-footer" className="bg-card border-t border-border/40 mt-auto pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          
          {/* Column 1: Brand Info */}
          <div className="md:col-span-4">
             <Link href="/" className="inline-flex items-center space-x-2 mb-4 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary group-hover:rotate-90 transition-transform duration-300"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m19 12-2 0"/><path d="m7 12-2 0"/><path d="m16.9 16.9-.7-.7"/><path d="m7.8 7.8-.7-.7"/><path d="m16.9 7.1-.7.7"/><path d="m7.8 16.2-.7.7"/></svg>
              <span className="font-bold font-headline text-lg">Spekulus</span>
            </Link>
            <p className="text-sm text-foreground/60">Reflect smarter, live better.</p>
          </div>

          {/* Column 2: Useful Links */}
          <div className="md:col-span-5">
            <h5 className="uppercase font-bold mb-4 font-headline text-primary text-center">Menu</h5>
            <div className="grid grid-cols-2 gap-8">
              <ul className="space-y-2">
                <li><Link href="/" className="text-foreground/80 hover:text-primary transition-colors">{translations.nav.home}</Link></li>
                <li><Link href="/#product" className="text-foreground/80 hover:text-primary transition-colors">{translations.nav.product}</Link></li>
                <li><Link href="/#advantages" className="text-foreground/80 hover:text-primary transition-colors">{translations.nav.advantages}</Link></li>
                <li><Link href="/dev-notes" className="text-foreground/80 hover:text-primary transition-colors">{translations.nav.devNotes}</Link></li>
              </ul>
              <ul className="space-y-2">
                <li><Link href="/creators" className="text-foreground/80 hover:text-primary transition-colors">{translations.nav.creators}</Link></li>
                <li><Link href="/#roadmap" className="text-foreground/80 hover:text-primary transition-colors">{translations.nav.roadmap}</Link></li>
                <li><Link href="/#faq" className="text-foreground/80 hover:text-primary transition-colors">{translations.nav.faq}</Link></li>
                <li><Link href="/#contact" className="text-foreground/80 hover:text-primary transition-colors">{translations.nav.contact}</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Column 3: Contact & Socials */}
          <div className="md:col-span-3">
             <h5 className="uppercase font-bold mb-4 font-headline text-primary">Contact</h5>
             <a href="mailto:spekulus.mirror@gmail.com" className="inline-flex items-center gap-2 text-primary hover:underline break-all">
               <Mail className="h-5 w-5 shrink-0" />
               <span>spekulus.mirror@gmail.com</span>
             </a>
             <div className="flex justify-start space-x-4 mt-6">
              <a href="https://www.linkedin.com/company/s-s-creation" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-primary transition-colors" aria-label="LinkedIn"><Linkedin /></a>
              <a href="https://github.com/S-S-Creation" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-primary transition-colors" aria-label="GitHub"><Github /></a>
              <a href="https://www.facebook.com/profile.php?id=100009139651094" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-primary transition-colors" aria-label="Facebook"><Facebook /></a>
            </div>
          </div>

        </div>
        <div className="mt-8 border-t border-border/20 pt-6 text-sm text-foreground/60">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p>&copy; 2025 S&S Creation – All rights reserved.</p>
                <div className="flex items-center justify-center gap-1.5">
                    Made with <Heart className="h-4 w-4 text-primary" fill="currentColor"/> by the Spekulus team.
                </div>
                {/* Admin Login Icon */}
                <Link href="/admin" aria-label="Admin Login" className="text-foreground/60 hover:text-primary transition-colors">
                    <KeyRound className="h-5 w-5" />
                </Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
