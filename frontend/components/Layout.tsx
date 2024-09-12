"use client";

import { Inter } from "next/font/google";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10000 } },
});

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
      <head>
        <meta
          name="google-site-verification"
          content="b1WctRF2NMXuJMYEFj300y6C86haSpYGcwiq2YXgyMM"
        />
      </head>
      <body className={inter.className}>
        <ChakraProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <Navbar />
            {children}
            <Footer />
          </QueryClientProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
