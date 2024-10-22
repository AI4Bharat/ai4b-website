import ToolComponent from "../../../../components/Dynamic/Tool";
import axios from "axios";
import { Metadata } from "next";

export const dynamicParams = true;

interface ToolType {
  title: string;
}


export async function generateMetadata({ params }: { params: { tool: string } }): Promise<Metadata> {
  const response = await axios.get(`https://admin.models.ai4bharat.org/tools/${params.tool}`);
  const toolData = response.data;

  return {
    title: toolData.title,
    description: toolData.description,
    keywords: toolData.keywords,
    openGraph: {
      title: toolData.title,
      description: toolData.description,
    },
    twitter: {
      description: toolData.description,
      card: "summary_large_image",
      creator: "@ai4bharat",
    },
  };
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
