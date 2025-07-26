import clsx from "clsx";
import { useToggle } from "../store/useToggle";

export const Toggle = () => {
  const { active, setActive } = useToggle();
  return (
    <>
      <div
        className={
          "w-[50px] flex p-[2px] rounded-[100px] justify-end " +
          clsx(active ? "bg-green" : "bg-grey")
        }
        onClick={() => {
          chrome.storage.local.set({ active: !active }, function () {
            setActive(!active);
          });
        }}
      >
        <div className="size-[27px] bg-white rounded-[50%]"></div>
        <div
          className={
            clsx(active ? "w-[0px]" : "w-[19px]") +
            " h-full transition-[width] duration-300 ease-in-out"
          }
        ></div>
      </div>
    </>
  );
};
