"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import PeopleSection from "../../../components/People";
import {
  Stack,
  Button,
  Flex,
  useBreakpointValue,
  ResponsiveValue,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import { API_URL } from "../config";
import { Property } from "csstype";
import { TabbedPeopleSection } from "../../../components/People";

// Function to fetch members
const fetchMembers = async () => {
  try {
    const response = await axios.get(`${API_URL}/member/`, {});
    return response.data;
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
};

// Function to render the selected section
const renderSection = ({
  members,
  section,
}: {
  members: Array<any>;
  section: string;
}) => {
  switch (section) {
    case "fdr":
      return (
        <PeopleSection
          heading="Meet Our Founders"
          description="In the vanguard of AI innovation stands a collective of extraordinary minds—the founders of AI4Bharat. Their visionary leadership has been the cornerstone of our journey, shaping the organization into a driving force of technological advancement."
          members={members}
          team={"1"}
        />
      );
    case "rnd":
      return (
        <PeopleSection
          heading="Meet Our Research & Development Team"
          description="Our RnD Team at AI4Bharat is the driving force behind our mission. Comprising innovative engineers, data scientists, and developers, they create cutting-edge solutions and applications that empower Indian languages and advance AI. With unwavering passion and a commitment to excellence, they are the engine of AI4Bharat success."
          members={members}
          team={"2"}
        />
      );
    case "vr":
      return (
        <PeopleSection
          heading="Meet Our Visiting Researchers"
          description="Meet the brains behind the breakthroughs, the individuals who bring a wealth of experience and innovation to our collaborative ecosystem. From pioneering research methodologies to pushing the boundaries of AI applications, our visiting researchers are at the forefront of shaping the future."
          members={members}
          team={"3"}
        />
      );
    case "dl":
      return (
        <PeopleSection
          heading="Meet Our Data Leads"
          description="Our Data Leads are the backbone of AI4Bharat linguistic innovations. These consummate professionals meticulously curate datasets, ensuring our language models comprehend human expression with unparalleled precision. Meet the professionals shaping the linguistic future at AI4Bharat, where dedication meets excellence."
          members={members}
          team={"4"}
        />
      );
    case "do":
      return (
        <PeopleSection
          heading="Delivery and Operations"
          description="Our operations team is the backbone of AI4Bharat, meticulously orchestrating the seamless functioning of projects. Their dedication to operational efficiency ensures that our AI initiatives not only meet but exceed expectations."
          members={members}
          team={"5"}
        />
      );
    case "al":
      return (
        <TabbedPeopleSection
          heading="Alumni"
          description="Meet our esteemed alumni, individuals who have contributed to the success of AI4Bharat and continue to drive innovation beyond."
          members={members}
          team={"6"}
        />
      );
  }
};

// Main component with static meta tags
export default function People() {
  const [members, setMembers] = useState([]);
  const [section, setSection] = useState("fdr");
  const { isLoading, error, data } = useQuery("fetchMembers", fetchMembers);
  const direction = useBreakpointValue({ base: "column", md: "row" });

  useEffect(() => {
    if (!isLoading && !error) {
      setMembers(data);
    }
  }, [error, data, isLoading]);

  // Set static meta tags for the page
  useEffect(() => {
    // Set a static page title and meta description
    document.title = "People - AI4Bharat";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Meet the talented individuals at AI4Bharat. From founders to R&D teams, visiting researchers, data leads, and operations, our people drive innovation in AI for Indian languages."
      );
    } else {
      const newMetaDescription = document.createElement("meta");
      newMetaDescription.name = "description";
      newMetaDescription.content =
        "Meet the talented individuals at AI4Bharat. From founders to R&D teams, visiting researchers, data leads, and operations, our people drive innovation in AI for Indian languages.";
      document.head.appendChild(newMetaDescription);
    }
  }, []);

  return (
    <Stack>
      <Flex
        p={5}
        justifyContent={"center"}
        gap={2}
        direction={direction as ResponsiveValue<Property.FlexDirection>}
        mt={10}
      >
        <Button
          onClick={() => setSection("fdr")}
          value={"fdr"}
          colorScheme="orange"
        >
          Founders
        </Button>
        <Button
          onClick={() => setSection("rnd")}
          value={"rnd"}
          colorScheme="orange"
        >
          Research and Development
        </Button>
        <Button
          onClick={() => setSection("vr")}
          value={"vr"}
          colorScheme="orange"
        >
          Visiting Researchers
        </Button>
        <Button
          onClick={() => setSection("dl")}
          value={"dl"}
          colorScheme="orange"
        >
          Data Leads
        </Button>
        <Button
          onClick={() => setSection("do")}
          value={"do"}
          colorScheme="orange"
        >
          Delivery and Operations
        </Button>
        <Button
          onClick={() => setSection("al")}
          value={"al"}
          colorScheme="orange"
        >
          Alumni
        </Button>
      </Flex>
      {renderSection({ members, section })}
    </Stack>
  );
}
