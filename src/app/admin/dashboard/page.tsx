
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Calendar, HelpCircle, ArrowRight, Users, LayoutGrid, Sparkles, Camera, Home, Cpu, History } from "lucide-react";

const dashboardItems = [
  { href: "/admin/hero", icon: <Home />, title: "Hero Section", description: "Manage the main hero section of the homepage.", buttonText: "Manage Hero" },
  { href: "/admin/product", icon: <Cpu />, title: "Product Section", description: "Manage the \"Anatomy of a Smart Mirror\" section.", buttonText: "Manage Section" },
  { href: "/admin/advantages", icon: <Sparkles />, title: "Advantages", description: "Manage the key advantages listed on the homepage.", buttonText: "Manage Advantages" },
  { href: "/admin/action-section", icon: <Camera />, title: "In Action Section", description: "Manage the \"See Spekulus in Action\" section.", buttonText: "Manage Section" },
  { href: "/admin/notes", icon: <FileText />, title: "Dev Notes", description: "Manage the developer notes that appear in the bottom ticker on the main site.", buttonText: "Manage Notes" },
  { href: "/admin/creators", icon: <Users />, title: "Creators", description: "Manage the creator profiles displayed on the 'Our Team' page.", buttonText: "Manage Creators" },
  { href: "/admin/roadmap", icon: <Calendar />, title: "Roadmap", description: "Update the public roadmap timeline displayed on the landing page.", buttonText: "Manage Roadmap" },
  { href: "/admin/faq", icon: <HelpCircle />, title: "FAQ", description: "Add, edit, or remove questions and answers from the FAQ section.", buttonText: "Manage FAQs" },
  { href: "/admin/pages", icon: <LayoutGrid />, title: "Pages Overview", description: "Manage site page visibility and status.", buttonText: "Manage Pages" },
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
              <Button className="w-full">
                {item.buttonText} <ArrowRight className="ml-2"/>
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
