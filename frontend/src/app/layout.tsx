import type { Metadata } from "next";
import Layout from "../../components/Layout";
import "./global.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai4bharat.iitm.ac.in"),
  title: {
    default: "AI4Bharat - Artificial Intelligence for Bharat",
    template: "%s - AI4Bharat",
  },
  description: "AI4Bharat is a research lab at IIT Madras which works on developing open-source datasets, tools, models and applications for Indian languages.",
  keywords: "AI4Bharat, artificial intelligence, Bharat, IIT Madras, Indian languages, datasets, tools, models, applications, open-source",
  openGraph: {
    title: {
      default: "AI4Bharat - Artificial Intelligence for Bharat",
      template: "%s - AI4Bharat",
    },
    images: ["/assets/ai4b-cover.jpg"],
  },
  twitter: {
    creator: "@ai4bharat",
    card: "summary_large_image",
    title: {
      default: "AI4Bharat - Artificial Intelligence for Bharat",
      template: "%s - AI4Bharat",
    },
    description: "AI4Bharat is a research lab at IIT Madras which works on developing open-source datasets, tools, models and applications for Indian languages.",
    images: ["/assets/ai4b-cover.jpg"],
  },
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // eslint-disable-next-line react/no-children-prop
  return <Layout children={children} />;
}
