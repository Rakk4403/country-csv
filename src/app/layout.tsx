import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect } from "react";
import ReactGA from "react-ga";
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
  const router = useRouter();

  useEffect(() => {
    // Google Analytics ID를 여기에 입력하세요
    ReactGA.initialize(process.env.NEXT_PUBLIC_GA_ID || "");

    // 페이지뷰를 추적하는 함수
    const handleRouteChange = (url: string) => {
      ReactGA.pageview(url);
    };

    // 라우트 변경 시 이벤트 리스너를 추가
    router.events.on("routeChangeComplete", handleRouteChange);

    // 컴포넌트 언마운트 시 이벤트 리스너를 제거
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
