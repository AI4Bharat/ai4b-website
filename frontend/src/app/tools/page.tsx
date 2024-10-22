import { Metadata } from "next";
import ToolsList from "../../../components/Tools";

const title = "Tools";
const description = "Discover AI4Bharat’s open-source tools designed to advance AI technologies for Indian languages. From data collection to translation and video subtitling, these tools leverage state-of-the-art machine learning models to create datasets, improve language processing, and bridge the gap between Indian languages and English.";
const keywords = "AI4Bharat, tools, shoonya, chitralekha, kathbath, karya, anuvaad, anudesh, indic glossary explorer, open-source, machine learning, Indian languages, data collection, translation, video subtitling";


export const metadata: Metadata = {
  title: `${title}`,
  description: `${description}`,
  keywords: `${keywords}`,
  openGraph: {
    title: `${title}`,
    description: `${description}`,
  },
  twitter: {
    description: `${description}`,
    card: "summary_large_image",
    creator: "@ai4bharat",
  },
};

export default function Tools() {
  return <ToolsList />;
}
