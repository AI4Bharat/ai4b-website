import ModelView from "../../../../../../components/Models";
import axios from "axios";
import { Metadata } from "next";

export const dynamicParams = true;

interface Model {
  area: string;
  title: string;
}

// Fetch list of models for generating static params
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

// Metadata generation function (server-side)
export async function generateMetadata({
  params,
}: {
  params: { area: string; title: string };
}): Promise<Metadata> {
  const title = `${params.title} - ${params.area} Model | AI4Bharat`;
  const description = `Explore the ${params.title} model under the ${params.area} category at AI4Bharat. Get insights into its capabilities and performance for Indian language AI tasks.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

// Main component to display the model view
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
