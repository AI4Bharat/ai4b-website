import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI4Bharat",
  description:
    "AI4Bharat is a research lab at IIT Madras which works on developing open-source datasets, tools, models and applications for Indian languages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChakraProvider>
          <Navbar />
          {children}
          <Footer />
        </ChakraProvider>
      </body>
    </html>
  );
}
