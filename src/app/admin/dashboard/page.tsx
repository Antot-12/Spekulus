
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Calendar, HelpCircle, ArrowRight, Users, Sparkles, Camera, Home, Cpu, History, UploadCloud, Swords, Handshake, MessageSquareQuote, MonitorPlay, Wrench, Files, Bell, Mail } from "lucide-react";

const dashboardItems = [
  { href: "/", icon: <MonitorPlay />, title: "View Live Site", description: "Go to the public homepage to see your changes live.", buttonText: "Go to Homepage", isExternal: true },
  { href: "/admin/hero", icon: <Home />, title: "Hero Section", description: "Manage the main hero section of the homepage.", buttonText: "Manage Hero" },
  { href: "/admin/product", icon: <Cpu />, title: "Product Section", description: "Manage the \"Anatomy of a Smart Mirror\" section.", buttonText: "Manage Section" },
  { href: "/admin/advantages", icon: <Sparkles />, title: "Advantages", description: "Manage the key advantages listed on the homepage.", buttonText: "Manage Advantages" },
  { href: "/admin/action-section", icon: <Camera />, title: "In Action Section", description: "Manage the \"See Spekulus in Action\" section.", buttonText: "Manage Section" },
  { href: "/admin/scenarios", icon: <MessageSquareQuote />, title: "Scenarios", description: "Manage the 'Why Spekulus?' real-life scenarios section.", buttonText: "Manage Scenarios" },
  { href: "/admin/comparison", icon: <Swords />, title: "Comparison Table", description: "Edit the competitor comparison table features.", buttonText: "Manage Table" },
  { href: "/admin/cooperation", icon: <Handshake />, title: "Cooperation Requests", description: "View and manage partnership and cooperation inquiries.", buttonText: "Manage Requests" },
  { href: "/admin/newsletter", icon: <Mail />, title: "Newsletter Section", description: "Manage the newsletter signup section on the homepage.", buttonText: "Manage Section" },
  { href: "/admin/notes", icon: <FileText />, title: "Dev Notes", description: "Manage the developer notes that appear in the bottom ticker on the main site.", buttonText: "Manage Notes" },
  { href: "/admin/creators", icon: <Users />, title: "Creators", description: "Manage the creator profiles displayed on the 'Our Team' page.", buttonText: "Manage Creators" },
  { href: "/admin/roadmap", icon: <Calendar />, title: "Roadmap", description: "Update the public roadmap timeline displayed on the landing page.", buttonText: "Manage Roadmap" },
  { href: "/admin/faq", icon: <HelpCircle />, title: "FAQ", description: "Add, edit, or remove questions and answers from the FAQ section.", buttonText: "Manage FAQs" },
  { href: "/admin/uploads", icon: <UploadCloud />, title: "Uploads", description: "View and manage all uploaded files and images.", buttonText: "Manage Uploads" },
  { href: "/admin/logs", icon: <History />, title: "Action Logs", description: "View a detailed audit trail of all actions performed in the admin panel.", buttonText: "View Logs" },
  { href: "/admin/maintenance", icon: <Wrench />, title: "Maintenance", description: "Enable or disable site-wide maintenance mode.", buttonText: "Manage Mode" },
  { href: "/admin/pages", icon: <Files />, title: "Pages Overview", description: "Manage site page visibility and status.", buttonText: "Manage Pages" },
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
            <Button asChild className="w-full">
              <Link
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
              >
                {item.buttonText} <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
