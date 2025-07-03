//main pages
import React from 'react';
import { API_URL } from '../../config';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BlogContentDisplay from './BlogContentDisplay';

interface Blog {
  id: number;
  title: string;
  description: string;
  published_on: string;
  image: string | null;
  related_link: string | null;
  markdown_content: string;
  page_url: string;
  cover_image?: { src: string; alt: string; caption?: string } | null;
  authors?: Array<{ name: string; affiliationId?: string }>;
  affiliations?: Array<{ id: string; name: string }>;
  publication_links?: Array<{ text: string; url: string; icon?: string }> | null;
  sections?: Array<{
    type: "table" | "image" | "examples" | "markdown"; 
    heading?: string;
    content?: string;
    headers?: string[];
    rows?: string[][];
    items?: Array<{ id: string; prompt: string; response: string }>;
    image?: { src: string; alt?: string; caption?: string };
  }>;
  team?: {
    students?: Array<{ name: string }>;
    advisors?: Array<{ name: string }>;
    contacts?: Array<{ name: string; email?: string }>;
  };
  bibtex?: string;
}

async function getIdFromPageUrl(pageUrl: string): Promise<number> {
  const res = await fetch(`${API_URL}/news/`, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', 
  });
  if (!res.ok) {
    notFound();
  }
  const blogs = await res.json();
  const blog = blogs.find((b: Blog) => b.page_url === pageUrl);
  if (!blog) {
    notFound();
  }
  return blog.id;
}

async function getBlogPostById(id: number): Promise<Blog> {
  const res = await fetch(`${API_URL}/news/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', 
  });
  if (!res.ok) {
    notFound();
  }
  return await res.json();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const blogId = await getIdFromPageUrl(params.slug);
    const blog = await getBlogPostById(blogId);
    const imageUrl = blog.image || blog.cover_image?.src;
    const images = imageUrl ? [imageUrl] : [];
    return {
      title: `${blog.title} | AI4Bharat Blog`,
      description: blog.description,
      keywords: [
        'AI4Bharat',
        blog.title,
        'artificial intelligence',
        'Indian languages',
        'research',
        'machine learning',
        'natural language processing'
      ].join(', '),
      authors: blog.authors?.map(author => ({ name: author.name })) || [{ name: 'AI4Bharat Team' }],
      openGraph: {
        title: blog.title,
        description: blog.description,
        images: images.map(img => ({
          url: img,
          width: 1200,
          height: 630,
          alt: blog.title
        })),
        url: `${API_URL}/news/blog/${blog.page_url}`,
        type: 'article',
        publishedTime: blog.published_on,
        siteName: 'AI4Bharat',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.description,
        images: images,
        creator: '@AI4Bharat',
        site: '@AI4Bharat',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    return {
      title: 'Blog Post | AI4Bharat',
      description: 'AI4Bharat blog post - Advancing AI for Indian languages',
    };
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  try {
    const blogId = await getIdFromPageUrl(params.slug);
    const blog = await getBlogPostById(blogId);
    return <BlogContentDisplay blog={blog} />;
  } catch (error) {
    notFound();
  }
}
