"use client";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  useColorModeValue,
  Skeleton,
  Wrap,
  Image,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";
import { ReactElement } from "react";
import {
  FcAbout,
  FcAssistant,
  FcCollaboration,
  FcDonate,
  FcManager,
} from "react-icons/fc";

const roleOrder: { [key: string]: number } = {
  "PhD Scholar": 1,
  "MS Scholar": 2,
  "Project Officer": 3,
  "Project Associate": 4,
};

interface CardProps {
  first_name: string;
  last_name: string;
  role: string;
  photo: string;
  gradYear: number;
}

interface Member {
  first_name: string;
  last_name: string;
  role: string;
  team: string;
  prevRol: string;
  photo: string;
  gradYear: number;
}

const TabbedCard = ({
  first_name,
  last_name,
  role,
  gradYear,
  photo,
}: CardProps) => {
  return (
    <Box
      maxW={{ base: "full", md: "max-content" }}
      w={"full"}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={3}
    >
      <Stack align={"start"} spacing={2}>
        {photo !== null ? (
          <Image
            src={photo}
            borderRadius="full"
            objectFit="cover"
            boxSize="200px"
            alt="Profile Photo"
            width={200}
          />
        ) : (
          <></>
        )}
        <Heading size="sm">
          {first_name + " " + last_name}
          {gradYear ? ` (${gradYear})` : ""}
        </Heading>
      </Stack>
    </Box>
  );
};

const Card = ({ first_name, last_name, role, gradYear, photo }: CardProps) => {
  return (
    <Box
      maxW={{ base: "full", md: "275px" }}
      w={"full"}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={5}
    >
      <Stack
        alignContent={"center"}
        justifyContent={"center"}
        justifyItems={"center"}
        alignItems={"center"}
        spacing={1}
      >
        {photo !== null ? (
          <Image
            src={photo}
            borderRadius="full"
            objectFit="cover"
            boxSize="150px"
            bgColor={"a4borange"}
            alt="Profile Photo"
          />
        ) : (
          <></>
        )}
        <Box justifyItems={"center"} mt={2}>
          <Heading size="md">{first_name + " " + last_name}</Heading>
          <Text mt={1} fontSize={"sm"}>
            {role}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};

export default function PeopleSection({
  heading,
  description,
  team,
  members,
}: {
  heading: string;
  description: string;
  team: string;
  members: Array<Member>;
}) {
  const sortedMembers = members.sort((a, b) => {
    const orderA = roleOrder[a.role] || 999; // Assign high value if role is not in the custom order
    const orderB = roleOrder[b.role] || 999;
    return orderA - orderB;
  });

  return (
    <Box p={4}>
      <Stack spacing={4} as={Container} maxW={"3xl"} textAlign={"center"}>
        <Heading fontSize={{ base: "2xl", sm: "4xl" }} fontWeight={"bold"}>
          {heading}
        </Heading>
        {/* <Text color={"gray.600"} fontSize={{ base: "sm", sm: "lg" }}>
          {description}
        </Text> */}
      </Stack>

      <Box m={12}>
        {Object.keys(members).length > 0 ? (
          <Wrap gridGap={3} justify={"center"}>
            {members.map((member) =>
              member.team === team ? (
                <Card
                  key={`${member.first_name}_${member.last_name}`}
                  first_name={member.first_name}
                  last_name={member.last_name}
                  role={member.role}
                  gradYear={member.gradYear}
                  photo={member.photo}
                />
              ) : (
                <></>
              )
            )}
          </Wrap>
        ) : (
          <Skeleton height={300} />
        )}
      </Box>
    </Box>
  );
}

// export function TabbedPeopleSection({
//   heading,
//   description,
//   team,
//   members,
// }: {
//   heading: string;
//   description: string;
//   team: string;
//   members: Array<Member>;
// }) {
//   const sections = ["MS", "MTech", "BTech", "Research", "Development"];
//   return (
//     <Box p={4}>
//       <Stack spacing={4} as={Container} maxW={"3xl"} textAlign={"center"}>
//         <Heading fontSize={{ base: "2xl", sm: "4xl" }} fontWeight={"bold"}>
//           {heading}
//         </Heading>
//       </Stack>
//       {sections.map((section, index) => (
//         <Container key={index} maxW={"5xl"} mt={12}>
//           <Heading fontSize="2xl" fontWeight={"bold"}>
//             {section}
//           </Heading>
//           <br />
//           {Object.keys(members).length > 0 ? (
//             <Flex flexWrap="wrap" gridGap={3}>
//               {members.map((member) =>
//                 member.team === team && member.prevRol === section ? (
//                   <TabbedCard
//                     key={`${member.first_name}_${member.last_name}`}
//                     first_name={member.first_name}
//                     last_name={member.last_name}
//                     gradYear={member.gradYear}
//                     role={member.role.split(",")[0]}
//                     photo={member.photo}
//                   />
//                 ) : (
//                   <></>
//                 )
//               )}
//             </Flex>
//           ) : (
//             <Skeleton height={300} />
//           )}
//           <Divider variant={"solid"} colorScheme="black" m={5} />
//         </Container>
//       ))}
//     </Box>
//   );
// }

export function TabbedPeopleSection({
  heading,
  description,
  team,
  members,
}: {
  heading: string;
  description: string;
  team: string;
  members: Array<Member>;
}) {
  const sections = [
    "MS",
    "MTech",
    "Dual Degree",
    "BTech",
    "Research",
    "Development",
  ];

  // Sort members by gradYear in ascending order
  const sortedMembers = [...members].sort((a, b) => a.gradYear - b.gradYear);

  return (
    <Box p={4}>
      <Stack spacing={4} as={Container} maxW={"3xl"} textAlign={"center"}>
        <Heading fontSize={{ base: "2xl", sm: "4xl" }} fontWeight={"bold"}>
          {heading}
        </Heading>
      </Stack>
      {sections.map((section, index) => (
        <Container key={index} maxW={"5xl"} mt={12}>
          <Heading fontSize="2xl" fontWeight={"bold"}>
            {section}
          </Heading>
          <br />
          {Object.keys(sortedMembers).length > 0 ? (
            <Flex flexWrap="wrap" gridGap={3}>
              {sortedMembers.map((member) =>
                member.team === team && member.prevRol === section ? (
                  <TabbedCard
                    key={`${member.first_name}_${member.last_name}`}
                    first_name={member.first_name}
                    last_name={member.last_name}
                    gradYear={member.gradYear}
                    role={member.role.split(",")[0]}
                    photo={member.photo}
                  />
                ) : (
                  <></>
                )
              )}
            </Flex>
          ) : (
            <Skeleton height={300} />
          )}
          <Divider variant={"solid"} colorScheme="black" m={5} />
        </Container>
      ))}
    </Box>
  );
}
