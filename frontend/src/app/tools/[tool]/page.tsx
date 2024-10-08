import ToolComponent from "../../../../components/Dynamic/Tool";
import axios from "axios";

export const dynamicParams = true;

interface ToolType {
  title: string;
}

export async function generateStaticParams() {
  const response = await axios.get("https://admin.models.ai4bharat.org/tools/");

  const tools = response.data;

  let params: any[] = [];

  tools.forEach((tool: ToolType) => {
    params.push({
      tool: tool.title,
    });
  });

  return params;
}

export default function Tool({ params }: { params: { tool: string } }) {
  return <ToolComponent slug={params.tool} />;
}
