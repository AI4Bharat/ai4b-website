import { Metadata } from "next";
import AreaComponent from "../../../../components/Dynamic/Area";

const areas = [
  {
    slug: "xlit",
    title: "Transliteration",
    description:
      "AI4Bharat's transliteration models, like IndicXlit, are designed to convert text between Indian languages and English using datasets like Aksharantar.",
    keywords:
      "transliteration, indicxlit, aksharantar, ai4bharat, ai4bharat iitm, iit madras, indian languages, english, indic languages, indic scripts, ai4bharat transliteration, ai4bharat indicxlit, ai4bharat aksharantar",
  },
  {
    slug: "nmt",
    title: "Machine Translation",
    description:
      "Our machine translation models like IndicTransv2 cover 22 Indian languages, using web data and human translations to compete with commercial models on various benchmarks.",
    keywords:
      "machine translation, indictransv2, ai4bharat, ai4bharat iitm, iit madras, indian languages, english, indic languages, indic scripts, ai4bharat machine translation, ai4bharat indictransv2",
  },
  {
    slug: "asr",
    title: "Automatic Speech Recognition (ASR)",
    description:
      "Our ASR models, including IndicWav2Vec and IndicWhisper, are trained on rich datasets like Kathbath, Shrutilipi and IndicVoices, covering multiple Indian languages.",
    keywords:
      "automatic speech recognition, asr, indicwav2vec, indicwhisper, ai4bharat, ai4bharat iitm, iit madras, indian languages, english, indic languages, indic scripts, ai4bharat asr, ai4bharat indicwav2vec, ai4bharat indicwhisper",
  },
  {
    slug: "tts",
    title: "Text-to-Speech (TTS)",
    description:
      "Our focus is on developing models that generate natural-sounding synthetic voices for Indian languages using web-crawled data and curated datasets like Rasa.",
    keywords: "text-to-speech, tts, ai4bharat, ai4bharat iitm, iit madras, indian languages, english, indic languages, indic scripts, ai4bharat tts",
  },
  {
    slug: "llm",
    title: "Large Language Models (LLMs)",
    description:
      "We pioneered multilingual LLMs like IndicBERT, IndicBART, and Airavata for Indian languages, trained on extensive diverse datasets like IndicCorpora and Sangraha.",
    keywords: "large language models, llms, indicbert, indicbart, airavata, ai4bharat, ai4bharat iitm, iit madras, indian languages, english, indic languages, indic scripts, ai4bharat llms, ai4bharat indicbert, ai4bharat indicbart, ai4bharat airavata",
  },
];

export async function generateStaticParams() {
  return areas.map((area) => ({
    slug: area.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: ParamsType;
}): Promise<Metadata> {
  const { slug } = params;

  const area = areas.find((area) => area.slug === slug);
  return {
    title: `${area?.title}`,
    description: `${area?.description}`,
    keywords: `${area?.keywords}`,
    openGraph: {
      title: `${area?.title}`,
      description: `${area?.description}`,
    },
    twitter: {
      description: `${area?.description}`,
      card: "summary",
      creator: "@ai4bharat",
    },
  };
}

interface ParamsType {
  slug: string;
  description: string;
  keywords: string;
}

export default function Areas({ params }: { params: ParamsType }) {
  const slug = params.slug;

  return <AreaComponent slug={slug} />;
}
