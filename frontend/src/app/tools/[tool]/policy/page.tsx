import { Container, Heading, Text, Stack, Box } from "@chakra-ui/react";
export const dynamicParams = true;

export async function generateStaticParams() {
  let params: any[] = [{ tool: "Kathbath" }, { tool: "Kathbath-Lite" }];
  return params;
}

const policies: any = {
  Kathbath: {
    description: `AI4Bharat built the AI4Bharat Kathbath app as a free app. This service is provided by AI4Bharat at no cost and is intended for use as is.

This page is used to inform visitors regarding our policies with the collection, use, and disclosure of personal information if anyone decided to use our service. 

If you choose to use our service, then you agree to the collection and use of information in relation to this policy. The personal information that we collect is used for providing access to the service. We will not use or share your information with anyone except as described in this Privacy Policy.

The terms used in this privacy policy have the same meanings as in our terms and conditions, which are accessible at AI4Bharat Kathbath unless otherwise defined in this Privacy Policy.
`,
    content: [
      {
        title: "Information Collection and Use",
        description:
          "For a better experience, while using our service, we may require you to provide us with certain personally identifiable information, including but not limited to phone number. The information that we request will be retained by us and used as described in this privacy policy. The app does use third-party services that may collect information used to identify you. Link to the privacy policy of third-party service providers used by the app: Google Play Services, Firebase Crashlytics.",
      },
      {
        title: "Log Data",
        description:
          'We want to inform you that whenever you use our service, in a case of an error in the app we collect data and information (through third-party products) on your phone called log data. This log data may include information such as your device Internet Protocol ("IP") address, device name, operating system version, the configuration of the app when utilizing our service, the time and date of your use of the service, and other statistics.',
      },
      {
        title: "Service Providers",
        description:
          "We may employ third-party companies and individuals due to the below mentioned reasons. We want to inform users of this service that these third parties have access to their personal information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.",
        bullets: [
          "To facilitate our service",
          "To provide the service on our behalf",
          "To perform service-related services",
          "To assist us in analyzing how our service is used",
        ],
      },
      {
        title: "Security",
        description:
          "We value your trust in providing us your personal information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.",
      },
      {
        title: "Children's Privacy",
        description:
          "These services do not address anyone under the age of 18. We do not knowingly collect personally identifiable information from children under 18 years of age. In the case we discover that a child under 18 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do the necessary actions.",
      },
      {
        title: "Changes to This Privacy Policy",
        description:
          "We may update our privacy policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new privacy policy on this page. This policy is effective as of 2023-10-20.",
      },
      {
        title: "Contact Us",
        description:
          "If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at tahir@smail.iitm.ac.in.",
      },
    ],
  },
  "Kathbath-Lite": {
    description: `AI4Bharat built the AI4Bharat Kathbath app as a free app. This service is provided by AI4Bharat at no cost and is intended for use as is.

This page is used to inform visitors regarding our policies with the collection, use, and disclosure of personal information if anyone decided to use our service. 

If you choose to use our service, then you agree to the collection and use of information in relation to this policy. The personal information that we collect is used for providing access to the service. We will not use or share your information with anyone except as described in this Privacy Policy.

The terms used in this privacy policy have the same meanings as in our terms and conditions, which are accessible at AI4Bharat Kathbath unless otherwise defined in this Privacy Policy.
`,
    content: [
      {
        title: "Information Collection and Use",
        description:
          "For a better experience, while using our service, we may require you to provide us with certain personally identifiable information, including but not limited to phone number. The information that we request will be retained by us and used as described in this privacy policy. The app does use third-party services that may collect information used to identify you. Link to the privacy policy of third-party service providers used by the app: Google Play Services, Firebase Crashlytics.",
      },
      {
        title: "Log Data",
        description:
          'We want to inform you that whenever you use our service, in a case of an error in the app we collect data and information (through third-party products) on your phone called log data. This log data may include information such as your device Internet Protocol ("IP") address, device name, operating system version, the configuration of the app when utilizing our service, the time and date of your use of the service, and other statistics.',
      },
      {
        title: "Service Providers",
        description:
          "We may employ third-party companies and individuals due to the below mentioned reasons. We want to inform users of this service that these third parties have access to their personal information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.",
        bullets: [
          "To facilitate our service",
          "To provide the service on our behalf",
          "To perform service-related services",
          "To assist us in analyzing how our service is used",
        ],
      },
      {
        title: "Security",
        description:
          "We value your trust in providing us your personal information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.",
      },
      {
        title: "Children's Privacy",
        description:
          "These services do not address anyone under the age of 18. We do not knowingly collect personally identifiable information from children under 18 years of age. In the case we discover that a child under 18 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do the necessary actions.",
      },
      {
        title: "Changes to This Privacy Policy",
        description:
          "We may update our privacy policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new privacy policy on this page. This policy is effective as of 2023-10-20.",
      },
      {
        title: "Contact Us",
        description:
          "If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at tahir@smail.iitm.ac.in.",
      },
    ],
  },
};

export default function PolicyView({ params }: { params: { tool: string } }) {
  const policy = policies[params.tool];
  return (
    <Container maxW={"7xl"} mb={10}>
      <Stack
        align={"center"}
        spacing={{ base: 8, md: 10 }}
        p={10}
        direction={{ base: "column", md: "row" }}
      >
        <Heading
          lineHeight={1.1}
          fontWeight={600}
          fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
        >
          <Text as={"span"} color={"a4borange"} position={"relative"}>
            Privacy Policy for
          </Text>{" "}
          <Text as={"span"} color={"a4bred"}>
            {params.tool}
          </Text>
        </Heading>
      </Stack>
      {policy.description}
      <br />
      <br />
      {Object.entries(policy.content).map(([key, val]) => (
        <Box key={key}>
          <br />
          <Heading>{(val as any).title}</Heading>
          <br />
          <Text>{(val as any).description}</Text>
          <br />
          {(val as any).bullets ? (
            <>
              {(val as any).bullets.map((bullet: string) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </>
          ) : (
            <></>
          )}
        </Box>
      ))}
    </Container>
  );
}
