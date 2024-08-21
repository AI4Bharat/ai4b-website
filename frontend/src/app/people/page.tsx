"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import PeopleSection from "../../../components/People";
import { Stack, Skeleton } from "@chakra-ui/react";

export default function People() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get("http://localhost:8000/member/");
        setMembers(response.data);
      } catch (error) {
        console.error("Error fetching members:", error);
        setMembers([]);
      }
    };

    fetchMembers();
  }, []);

  return (
    <Stack>
      <PeopleSection
        heading="Visionaries Behind AI4Bharat: Meet Our Founders"
        description="In the vanguard of AI innovation stands a collective of extraordinary minds—the founders of AI4Bharat. Their visionary leadership has been the cornerstone of our journey, shaping the organization into a driving force of technological advancement."
        members={members}
        team={"1"}
      />
      <PeopleSection
        heading="Meet Our Research & Development Team"
        description="Our RnD Team at AI4Bharat is the driving force behind our mission. Comprising innovative engineers, data scientists, and developers, they create cutting-edge solutions and applications that empower Indian languages and advance AI. With unwavering passion and a commitment to excellence, they are the engine of AI4Bharat success."
        members={members}
        team={"2"}
      />
      <PeopleSection
        heading="Distinguished Minds at AI4Bharat: Our Visiting Researchers"
        description="Meet the brains behind the breakthroughs, the individuals who bring a wealth of experience and innovation to our collaborative ecosystem. From pioneering research methodologies to pushing the boundaries of AI applications, our visiting researchers are at the forefront of shaping the future."
        members={members}
        team={"3"}
      />
      <PeopleSection
        heading="Meet Our Data Leads: Architects of Linguistic Precision"
        description="Our Data Leads are the backbone of AI4Bharat linguistic innovations. These consummate professionals meticulously curate datasets, ensuring our language models comprehend human expression with unparalleled precision. Meet the professionals shaping the linguistic future at AI4Bharat, where dedication meets excellence."
        members={members}
        team={"4"}
      />
      <PeopleSection
        heading="Delivery and Operations"
        description="Our operations team is the backbone of AI4Bharat, meticulously orchestrating the seamless functioning of projects. Their dedication to operational efficiency ensures that our AI initiatives not only meet but exceed expectations."
        members={members}
        team={"5"}
      />
      <PeopleSection
        heading="Meet Our Language Experts at AI4Bharat"
        description="Our language experts at AI4Bharat, supported by Bhashini's generous funding, are the architects of transformative linguistic solutions. With skilled translators and transcription specialists, they harness the power of language to break barriers and advance AI."
        members={members}
        team={"6"}
      />
    </Stack>
  );
}
