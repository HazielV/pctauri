import { Moon, Sun } from "lucide-react";
import { useTheme } from "./themeProvider";
import { cn } from "@/lib/utils";
export default function ToggleTheme() {
  const { setTheme, theme } = useTheme();

  return (
    <div
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className=" flex gap-2 border p-2 rounded-full z-10 relative items-center justify-center cursor-pointer group"
    >
      <div
        className={cn(
          "absolute rounded-full size-7 transition-all transform left-1 ",
          theme === "dark"
            ? "translate-x-7 bg-blue-600"
            : "translate-x-0 bg-blue-200",
        )}
      ></div>
      <Sun size={20} className="z-20" />
      <Moon size={20} className="z-20" />
    </div>
  );
}
