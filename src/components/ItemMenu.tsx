import { useLocation, useRouter } from "wouter";
import { JSX } from "react";
export default function ItemMenu({
  icono,
  descripcion,
  className,
  url,
  onClick,
}: {
  icono: JSX.Element;
  descripcion: string;
  className?: string;
  url?: string;
  onClick?: () => void;
}) {
  const router = useRouter();
  const [location] = useLocation();
  const pathActual = router.base + location;
  return (
    <>
      {url === pathActual ? (
        <li
          onClick={onClick}
          className={
            "flex cursor-pointer  relative after:-inset-1  after:rounded-xl  after:absolute  after:transition  p-2 group after:bg-blue-100/40 text-blue-600 dark:after:bg-transparent dark:after:from-blue-600/5 dark:after:to-blue-600/60  dark:text-blue-100 dark:after:from-5%  dark:after:bg-linear-to-r "
          }
        >
          <div className="z-10">{icono}</div>
          <div className="absolute self-center justify-center place-self-center left-full p-1 pointer-events-none group-hover:pointer-events-auto">
            <div className="bg-[#191A30] dark:bg-[#F8F8FA] dark:text-black text-xs font-medium  invisible   px-3 py-1.5 rounded-lg group-hover:visible translate-x-0 transition group-hover:translate-x-2.5 whitespace-nowrap  text-white">
              {descripcion}
            </div>
          </div>
        </li>
      ) : url && url !== "/admin" && pathActual.includes(url) ? (
        <li
          onClick={onClick}
          className={
            "flex cursor-pointer  relative after:-inset-1  after:rounded-xl  after:absolute  after:transition  p-2 group after:bg-blue-100/40 text-blue-600 dark:after:bg-transparent dark:after:from-blue-600/5 dark:after:to-blue-600/60  dark:text-blue-100 dark:after:from-5%  dark:after:bg-linear-to-r"
          }
        >
          <div className="z-10">{icono}</div>
          <div className="absolute self-center justify-center place-self-center left-full p-1 pointer-events-none group-hover:pointer-events-auto">
            <div className="bg-[#191A30] dark:bg-[#F8F8FA] dark:text-black text-xs font-medium  invisible   px-3 py-1.5 rounded-lg group-hover:visible translate-x-0 transition group-hover:translate-x-2.5 whitespace-nowrap  text-white">
              {descripcion}
            </div>
          </div>
        </li>
      ) : (
        <li
          onClick={onClick}
          className={
            "flex cursor-pointer  relative after:-inset-1  after:rounded-xl  after:absolute after:scale-0 after:transition hover:after:scale-100 p-2 group " +
            (className
              ? className.toString()
              : "text-gray-500/80 hover:text-blue-600 after:bg-blue-100/40 dark:after:bg-transparent dark:after:from-blue-600/5 dark:after:to-blue-600/60  dark:text-gray-500 dark:hover:text-blue-100 dark:after:from-5%  dark:after:bg-linear-to-r ")
          }
        >
          <div className="z-10">{icono}</div>
          <div className="absolute self-center justify-center place-self-center left-full p-1 pointer-events-none group-hover:pointer-events-auto">
            <div className="bg-[#191A30] dark:bg-[#F8F8FA] dark:text-black text-xs font-medium  invisible   px-3 py-1.5 rounded-lg group-hover:visible translate-x-0 transition group-hover:translate-x-2.5 whitespace-nowrap  text-white">
              {descripcion}
            </div>
          </div>
        </li>
      )}
    </>
  );
}
