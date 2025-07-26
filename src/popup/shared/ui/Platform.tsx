export const Platform = () => {
  const naverBlogUrl =
    "https://cdn.discordapp.com/attachments/1041239050864033822/1398630415622996089/QWVJJqQ2U_KE1A1BkDI5WwhFcIeQ4C9uGIgibUWPHr3ev65fv4JW9_Yd-66EVu_0TF8mMXIh9k_dnrv_DlLBCw.png?ex=68860f94&is=6884be14&hm=b7a1c9d4afa2779b8ee602f5fe57f143a2cdef0f1f877407da4ce9175f915756&";

  return (
    <>
      <div className="flex flex-col gap-[5px] items-center">
        <p className="text-body text-black font-bold">제공 플랫폼</p>
        <div className="flex gap-[5px] items-center">
          <p className="text-caption font-bold text-naver_green">
            네이버 블로그
          </p>
          <img src={naverBlogUrl} className="size-[25px] select-none" />
        </div>
      </div>
    </>
  );
};
