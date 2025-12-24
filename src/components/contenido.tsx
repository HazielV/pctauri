import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const LayoutContenido = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn(" flex-1 flex flex-col overflow-auto ", className)}
    {...props}
  />
);

export const Contendor = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn("relative flex-1 flex flex-col gap-5 mt-5 px-5", className)}
    {...props}
  />
);

export const ContenedorTabla = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn(
      " border border-gray-200 dark:border-gray-500/40 rounded-2xl overflow-x-auto flex flex-col",
      className
    )}
    {...props}
  />
);
export const BusquedaTabla = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn(
      "px-5 flex justify-between py-1.5 items-center flex-1",
      className
    )}
    {...props}
  />
);
export const Table = ({ className, ...props }: ComponentProps<"table">) => (
  <table className={cn("table-auto text-sm w-full", className)} {...props} />
);

export const TableHeader = ({
  className,
  ...props
}: ComponentProps<"thead">) => (
  <thead className={cn("", className)} {...props} />
);
export const TableBody = ({ className, ...props }: ComponentProps<"tbody">) => (
  <tbody className={cn("", className)} {...props} />
);
export const TableRow = ({ className, ...props }: ComponentProps<"tr">) => (
  <tr
    className={cn(
      "ext-left text-xs font-medium text-gray-400 dark:text-gray-200 border-t border-gray-200 dark:border-gray-500/40 *:px-5 *:py-3.5",
      className
    )}
    {...props}
  />
);
export const TableHead = ({ className, ...props }: ComponentProps<"th">) => (
  <th className={cn("", className)} {...props} />
);
export const TableCell = ({ className, ...props }: ComponentProps<"td">) => (
  <td className={cn("", className)} {...props} />
);
