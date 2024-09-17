import { datasets } from "../config";

export async function generateStaticParams() {
  let params: any[] = datasets;

  return params;
}

export default function Dataset({ params }: { params: { title: string } }) {
  return (
    <>
      {params.title.includes("rasa") ? (
        <iframe
          src={"https://rasa.ai4bharat.org/"}
          title={`${params.title}`}
          width="100%"
          height={2000}
        />
      ) : (
        <iframe
          src={`https://datasets.ai4bharat.org/${params.title}`}
          title={`${params.title}`}
          width="100%"
          height={2000}
        />
      )}
    </>
  );
}
