"use client";

import { Inter } from "next/font/google";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "Crimson Text",
    body: "Crimson Text",
  },
  colors: {
    a4bred: "#ea2027",
    a4borange: "#ff6600",
  },
});

const inter = Inter({ subsets: ["latin"] });

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChakraProvider theme={theme}>
          <Navbar />
          {children}
          <Footer />
        </ChakraProvider>
      </body>
    </html>
  );
}
