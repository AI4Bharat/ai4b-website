"use client";
import { useParams } from "next/navigation";
import ModelView from "../../../../../components/Models";

export default function Model() {
  const params = useParams();
  const slug = params.slug;
  return <ModelView slug={slug as Array<string>} />;
}
