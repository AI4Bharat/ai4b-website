import ModelView from "../../../../../../components/Models";

export const dynamicParams = true;

interface Model {
  area: string;
  title: string;
  description: string;
  keywords: string;
}

import axios from "axios";

export async function generateStaticParams() {
  const response = await axios.get(
    "https://admin.models.ai4bharat.org/models/"
  );
  const models = response.data;

  let params: any[] = [];

  models.forEach((model: Model) => {
    params.push({
      area: model.area,
      title: model.title,
    });
  });

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { area: string; title: string };
}) {
  const response = await axios.get(
    `https://admin.models.ai4bharat.org/models/${params.title}`
  );
  const model = response.data;

  return {
    title: `${model.title}`,
    description: `${model.description}`,
    keywords: `${model.keywords}`,
    openGraph: {
      title: `${model.title}`,
      description: `${model.description}`,
    },
    twitter: {
      description: `${model.description}`,
      card: "summary",
      creator: "@ai4bharat",
    },
  };
}

export default function Model({
  params,
}: {
  params: { area: string; title: string };
}) {
  return (
    <>
      <ModelView area={params.area} title={params.title} />
    </>
  );
}
