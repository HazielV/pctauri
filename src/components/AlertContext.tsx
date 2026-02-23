import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAlertStore } from "@/store/AlertState";
import { toast } from "sonner";
import {
  Loader2Icon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
} from "lucide-react";

const icons = {
  success: <CircleCheckIcon className="size-10 text-green-500" />,
  info: <InfoIcon className="size-10 text-blue-500" />,
  warning: <TriangleAlertIcon className="size-10 text-yellow-500" />,
  error: <OctagonXIcon className="size-10 text-red-500" />,
};

export function AlertContext() {
  const { isOpen, options, isLoading, closeAlert, setLoading } =
    useAlertStore();

  if (!options) return null;

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault(); // Crucial: Evita el cierre automático de shadcn
    if (options.onAction) {
      setLoading(true);
      try {
        // Si esta promesa falla (throw error), el código saltará al catch
        await options.onAction();
        closeAlert(); // Solo se cierra si la promesa fue exitosa
      } catch (error) {
        // El modal se queda abierto, el spinner se quita y el usuario puede reintentar
        console.error("Error en la acción:", error);
        toast.error("Error al procesar la solicitud");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => !open && !isLoading && closeAlert()}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader className="items-center text-center">
          <div className="mb-4">{icons[options.variant || "info"]}</div>
          <AlertDialogTitle className="text-xl">
            {options.title}
          </AlertDialogTitle>
          <AlertDialogDescription>{options.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel disabled={isLoading}>
            {options.cancelText}
          </AlertDialogCancel>
          <Button
            onClick={handleAction}
            disabled={isLoading}
            variant={options.variant === "error" ? "destructive" : "default"}
          >
            {isLoading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            {options.actionText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
