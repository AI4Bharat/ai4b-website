import ModelView from "../../../../../components/Models";

interface ParamsType {
  slug: Array<string>;
}

interface Model {
  area: string;
  title: string;
}

export async function generateStaticParams() {
  const models = await fetch("https://admin.models.ai4bharat.org/models/").then(
    (res) => res.json()
  );

  return models.map((model: Model) => ({
    slug: [model.area, model.title],
  }));
}

export default function Model({ params }: { params: ParamsType }) {
  const slug = params.slug;
  return (
    <>
      <ModelView slug={slug} />
    </>
  );
}
