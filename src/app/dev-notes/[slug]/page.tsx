import type { Metadata } from "next";
import { getDevNoteBySlug } from "@/lib/db/actions";
import { cloudinaryUrl } from "@/lib/cloudinary";
import DevNoteClient from "./DevNoteClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Fetch the note in English for default OG tags
  const notes = await getDevNoteBySlug(slug, "en");
  const note = Array.isArray(notes) ? notes[0] : notes;

  if (!note) {
    return {
      title: "Dev Note Not Found | Spekulus",
      description: "The requested developer note could not be found.",
    };
  }

  const title = `${note.title} | Spekulus Dev Notes`;
  const description = note.summary || note.content?.slice(0, 160) || "Read this developer note from the Spekulus team.";

  // Get image URL
  const imageUrl = (note as any).cloudinaryId
    ? cloudinaryUrl((note as any).cloudinaryId, { width: 1200, height: 630 })
    : note.imageId
      ? `https://spekulus.vercel.app/api/images/${note.imageId}`
      : "https://spekulus.vercel.app/og-image.png";

  return {
    title,
    description,
    authors: note.author ? [{ name: note.author }] : undefined,
    openGraph: {
      type: "article",
      title: note.title,
      description,
      url: `https://spekulus.vercel.app/dev-notes/${slug}`,
      siteName: "Spekulus",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: note.title,
        },
      ],
      publishedTime: note.date ? new Date(note.date).toISOString() : undefined,
      authors: note.author ? [note.author] : undefined,
      tags: note.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function DevNotePage({ params }: PageProps) {
  const { slug } = await params;
  return <DevNoteClient slug={slug} />;
}
