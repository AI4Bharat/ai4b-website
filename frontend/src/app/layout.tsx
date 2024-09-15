import type { Metadata } from "next";
import Layout from "../../components/Layout";
import "./global.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai4bharat.iitm.ac.in"),
  title: "AI4Bharat",
  description:
    "AI4Bharat is a research lab at IIT Madras which works on developing open-source datasets, tools, models and applications for Indian languages.",
  icons: ["/assets/logos/ai4blogolarge.png"],
  keywords: ["AI4Bharat", "IIT Madras", "research", "open-source", "Indian languages", "AI", "natural language processing", "NLP", "speech recognition", "speech synthesis", "asr", "tts", "language models", "llm", "bhashini", "digital india", "computer vision", "machine learning", "deep learning"],
  openGraph: {
    images: "/assets/logos/ai4blogolarge.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Layout children={children} />;
}
