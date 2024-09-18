import { Metadata } from "next";
import DatasetsList from "../../../components/DatasetsPage";


const title = "Datasets";
const description = "Explore AI4Bharat’s extensive collection of open-source datasets developed for Indian languages. From speech data to translation and linguistic resources, these datasets support a wide range of AI models, including IndicVoices, Shrutilipi, Samanantar, IndicCorp, and more.";
const keywords = "AI4Bharat, datasets, IndicVoices, Shrutilipi, Samanantar, IndicCorp, open-source, machine learning, Indian languages, speech data, translation, linguistic resources";


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
    card: "summary",
    creator: "@ai4bharat",
  },
};

export default function DatasetsPage() {
  return <DatasetsList />;
}
