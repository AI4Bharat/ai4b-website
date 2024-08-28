import ToolComponent from "../../../../components/Dynamic/Tool";

interface ParamsType {
  slug: string;
}

interface ToolType {
  title: string;
}

export async function generateStaticParams() {
  const tools = await fetch("https://admin.models.ai4bharat.org/tools/").then(
    (res) => res.json()
  );

  return tools.map((tool: ToolType) => ({
    slug: tool.title,
  }));
}

export default function Tool({ params }: { params: ParamsType }) {
  const slug = params.slug;

  return <ToolComponent slug={slug} />;
}
