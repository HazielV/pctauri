import Aside from "./Aside";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className=" bg-[#f3f3f78c] dark:bg-[#1F1F21] w-screen h-screen flex pt-6 ">
      <Aside />
      <div className="flex-1 flex flex-col overflow-hidden ">
        <main className="flex-1 flex flex-col pl-2 bg-white dark:bg-[#101012] ml-2 mt-4 rounded-tl-2xl shadow overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
