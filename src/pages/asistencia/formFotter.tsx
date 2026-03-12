import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { useModalStore } from "@/store/modalState";
import { LoaderCircle } from "lucide-react";

export default function FormFotter() {
  const { formId, isLoading } = useModalStore();
  return (
    <div className="flex w-full gap-2 ">
      <DialogClose asChild>
        <Button className="flex-1" variant="outline">
          Cancel
        </Button>
      </DialogClose>
      <Button
        type="submit"
        form={formId}
        disabled={isLoading}
        className="flex-1"
      >
        {isLoading ? (
          <LoaderCircle size={17} className="transition animate-spin" />
        ) : (
          "Guardar"
        )}
      </Button>
    </div>
  );
}
