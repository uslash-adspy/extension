import { useLayoutEffect, useState } from "react";
import { Logo } from "./shared/ui/Logo";
import { Slogan } from "./shared/ui/Slogan";
import { Platform } from "./shared/ui/Platform";
import { Toggle } from "./shared/ui/Toggle";
import { useToggle } from "./shared/store/useToggle";
import { Guide } from "./shared/ui/Guide";

function App() {
  const [isInBlog, setIsInBlog] = useState(false);
  const { setActive } = useToggle();

  useLayoutEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTabUrl = tabs[0]?.url || "";

      const isNaverBlog = currentTabUrl.includes("https://blog.naver.com");
      const width = isNaverBlog ? 247 : 287;
      const height = isNaverBlog ? 243 : 143;

      setIsInBlog(isNaverBlog);

      document.body.style.width = `${width}px`;
      document.body.style.height = `${height}px`;
    });

    chrome.storage.local.get(["active"], function (result) {
      setActive(result.active ?? false);
    });
  }, []);

  /**
   * naver blog 진입시 얼리 리턴
   */
  if (isInBlog) {
    return (
      <div className="bg-white flex flex-col gap-[10px] items-center p-[15px] w-full h-full">
        <Logo />
        <Slogan />
        <Platform />
        <Toggle />
        <Guide />
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col gap-[10px] items-center p-[15px] w-full h-full">
      <Logo />
      <div className="flex flex-col gap-[10px] items-center w-full">
        <p className="text-body text-black">
          <span className="font-bold text-light_main">AdSPY</span>는 아래
          플랫폼에서만 제공합니다.
        </p>
        <div className="w-full h-[1px] bg-dark_grey"></div>
        <Platform />
      </div>
    </div>
  );
}

export default App;
