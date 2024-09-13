import type { Metadata } from "next";
import Layout from "../../components/Layout";
import "./global.css";

export const metadata: Metadata = {
  title: "AI4Bharat",
  description:
    "AI4Bharat is a research lab at IIT Madras which works on developing open-source datasets, tools, models and applications for Indian languages.",
  openGraph: {
    images: "/assets/logos/ai4bclogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Layout children={children} />;
}
