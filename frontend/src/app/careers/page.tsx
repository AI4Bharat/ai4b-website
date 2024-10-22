import {
  Box,
  Container,
} from "@chakra-ui/react";
import CareerContactBanner from "../../../components/CareerContactBanner";
import Jobs from "../../../components/CareerJobList";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Careers',
  description: 'AI4Bharat is a research lab at IIT Madras which works on developing open-source datasets, tools, models and applications for Indian languages.',
  openGraph: {
    title: 'Careers',
    description: 'AI4Bharat is a research lab at IIT Madras which works on developing open-source datasets, tools, models and applications for Indian languages.',
  },
  twitter: {
    description: 'AI4Bharat is a research lab at IIT Madras which works on developing open-source datasets, tools, models and applications for Indian languages.',
    card: 'summary_large_image',
    creator: '@ai4bharat',
  },
}

export default function Careers() {

  return (
    <Box p={4}>
      <CareerContactBanner />

      <Container maxW={"5xl"} mt={12}>
        <Jobs />
      </Container>
    </Box>
  );
}
