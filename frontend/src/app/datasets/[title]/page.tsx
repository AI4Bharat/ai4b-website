export async function generateStaticParams() {
  let params: any[] = [
    { title: "svarah" },
    { title: "lahaja" },
    { title: "shrutilipi" },
    { title: "sangraha" },
    { title: "samanantar" },
    { title: "aksharantar" },
    { title: "IndicVoices-R" },
    { title: "IndicOOV" },
    { title: "FBI" },
    { title: "Bhasha-Abhijnaanam" },
  ];

  return params;
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
