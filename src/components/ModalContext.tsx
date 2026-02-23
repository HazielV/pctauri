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

export function ModalContext() {
  const { isOpen, view, title, toggle, formId, footer, isLoading } =
    useModalStore();
  return (
    <Dialog open={isOpen} defaultOpen={false} onOpenChange={toggle}>
      <DialogContent className="max-w-4/5 md:max-w-xl lg:max-w-2xl xl:max-w-3xl ">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Los campos con <span className="text-destructive">*</span> son
            obligatorios.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] py-5 px-3 -mx-3">{view}</ScrollArea>

        <DialogFooter>
          {footer ? (
            footer
          ) : (
            <>
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
