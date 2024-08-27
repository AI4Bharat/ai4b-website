"use client";
import { useParams } from "next/navigation";
import { VStack } from "@chakra-ui/react";
import ModelView from "../../../../../components/Models";
import ModelInstallationTestimonial from "../../../../../components/ModelInstTest";

export default function Model() {
  const params = useParams();
  const slug = params.slug;
  return (
    <>
      <ModelView slug={slug as Array<string>} />
      <ModelInstallationTestimonial />
    </>
  );
}
