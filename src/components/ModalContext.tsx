import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/store/modalState";
import { LoaderCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

export function ModalContext() {
  const { isOpen, size, view, title, toggle, formId, footer, isLoading } =
    useModalStore();
  return (
    <Dialog open={isOpen} defaultOpen={false} onOpenChange={toggle}>
      <DialogContent
        className={cn(
          "max-w-4/5   ",
          size === "sm" && "sm:max-w-[21rem] ",
          size === "md" && "md:max-w-xl lg:max-w-2xl",
          size === "lg" && "md:max-w-xl lg:max-w-2xl xl:max-w-3xl",
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Los campos con <span className="text-destructive">*</span> son
            obligatorios.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] py-5 px-3 -mx-3">{view}</ScrollArea>

        {footer ? (
          footer
        ) : (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" form={formId} disabled={isLoading}>
              {isLoading ? (
                <LoaderCircle size={17} className="transition animate-spin" />
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
