import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import ReactGA from "react-ga";

const MyApp = ({ Component, pageProps }: AppProps) => {
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

  return <Component {...pageProps} />;
};

export default MyApp;
