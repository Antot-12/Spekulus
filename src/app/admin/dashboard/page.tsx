
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Calendar, HelpCircle, ArrowRight, Users, LayoutGrid, Sparkles, Camera, Home, Cpu, History, UploadCloud, Swords, Handshake, MessageSquareQuote, MonitorPlay } from "lucide-react";

const dashboardItems = [
  { href: "/", icon: <MonitorPlay />, title: "View Live Site", description: "Go to the public homepage to see your changes live.", buttonText: "Go to Homepage", isExternal: true },
  { href: "/admin/hero", icon: <Home />, title: "Hero Section", description: "Manage the main hero section of the homepage.", buttonText: "Manage Hero" },
  { href: "/admin/product", icon: <Cpu />, title: "Product Section", description: "Manage the \"Anatomy of a Smart Mirror\" section.", buttonText: "Manage Section" },
  { href: "/admin/advantages", icon: <Sparkles />, title: "Advantages", description: "Manage the key advantages listed on the homepage.", buttonText: "Manage Advantages" },
  { href: "/admin/action-section", icon: <Camera />, title: "In Action Section", description: "Manage the \"See Spekulus in Action\" section.", buttonText: "Manage Section" },
  { href: "/admin/scenarios", icon: <MessageSquareQuote />, title: "Scenarios", description: "Manage the 'Why Spekulus?' real-life scenarios section.", buttonText: "Manage Scenarios" },
  { href: "/admin/comparison", icon: <Swords />, title: "Comparison Table", description: "Edit the competitor comparison table features.", buttonText: "Manage Table" },
  { href: "/admin/partner", icon: <Handshake />, title: "Partner CTA", description: "Manage the partner and investor call-to-action section.", buttonText: "Manage CTA" },
  { href: "/admin/notes", icon: <FileText />, title: "Dev Notes", description: "Manage the developer notes that appear in the bottom ticker on the main site.", buttonText: "Manage Notes" },
  { href: "/admin/creators", icon: <Users />, title: "Creators", description: "Manage the creator profiles displayed on the 'Our Team' page.", buttonText: "Manage Creators" },
  { href: "/admin/roadmap", icon: <Calendar />, title: "Roadmap", description: "Update the public roadmap timeline displayed on the landing page.", buttonText: "Manage Roadmap" },
  { href: "/admin/faq", icon: <HelpCircle />, title: "FAQ", description: "Add, edit, or remove questions and answers from the FAQ section.", buttonText: "Manage FAQs" },
  { href: "/admin/pages", icon: <LayoutGrid />, title: "Pages Overview", description: "Manage site page visibility and status.", buttonText: "Manage Pages" },
  { href: "/admin/uploads", icon: <UploadCloud />, title: "Uploads", description: "View and manage all uploaded files and images.", buttonText: "Manage Uploads" },
  { href: "/admin/logs", icon: <History />, title: "Action Logs", description: "View a detailed audit trail of all actions performed in the admin panel.", buttonText: "View Logs" },
];

export default function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {dashboardItems.map((item, index) => (
        <Card
          key={item.href}
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">{item.icon} {item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={item.href} passHref>
              <Button asChild className="w-full">
                  <a target={item.isExternal ? "_blank" : undefined} rel={item.isExternal ? "noopener noreferrer" : undefined}>
                    {item.buttonText} <ArrowRight className="ml-2"/>
                  </a>
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
