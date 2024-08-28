import AreaComponent from "../../../../components/Dynamic/Area";

export async function generateStaticParams() {
  const areas = ["xlit", "nmt", "asr", "tts", "llm"];

  return areas.map((area) => ({
    slug: area,
  }));
}

interface ParamsType {
  slug: string;
}

export default function Areas({ params }: { params: ParamsType }) {
  const slug = params.slug;

  return <AreaComponent slug={slug} />;
}
