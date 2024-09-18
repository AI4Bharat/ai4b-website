import { datasets } from "../config";
import { Metadata } from "next";

export async function generateStaticParams() {
  let params: any[] = datasets;

  return params;
}




export async function generateMetadata({ params }: { params: { title: string } }): Promise<Metadata> {
  const dataset = datasets.find((d) => d.title === params.title);

  if (!dataset) {
    return {
      title: "Dataset not found",
      description: "The requested dataset could not be found.",
    };
  }

  const { title } = dataset;

  return {
    title: title + " Dataset",
    openGraph: {
      title: title + " Dataset",
    },
  };
}

export default function Dataset({ params }: { params: { title: string } }) {
  return (
    <iframe
      src={`https://datasets.ai4bharat.org/${params.title}`}
      title={`${params.title}`}
      width="100%"
      height={2000}
    />
  );
}
