import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Country Continent",
  description:
    "You can find the continent of the country, copy or download the list of countries and continents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <title>Continent by Country</title>
        <meta
          name="description"
          content="Enter country names and find their continents. If the country name is
          not found, select from the list of similar names."
        />
        <meta property="og:title" content="Continent by Country" />
        <meta
          property="og:description"
          content="Enter country names and find their continents. If the country name is
          not found, select from the list of similar names."
        />
        {/* <meta property="og:image" content="공유될 때 표시될 이미지 URL" /> */}
        <meta property="og:url" content="country-csv.vercel.app" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <body className={inter.className}>{children}</body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
    </html>
  );
}
