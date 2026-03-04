import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { useState } from "react";
import { useActions } from "./useActions";

export default function Page() {
  const {loginMutation} = useActions()
  const [formdata, setFormData] = useState<Record<string, string > >({
    "username": "",
    "password": ""
  })
  const onChangeInput = (name: string, password: string)=>{
    setFormData(prev => (
      {...prev, [name]: password}
    ))
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos enviados:", formdata);
    // Aquí iría tu lógica de autenticación
    loginMutation.mutate({values: formdata})
  };
  return (
    <div className="mt-10.5 dark:text-white grid place-content-center w-screen h-screen">
      <form onSubmit={handleSubmit} action="" className="w-sm p-7 py-8 border rounded-2xl">
        <h1 className="text-center text-2xl w-xs">Bienvenido al sistema de autoescuela</h1>
        <FieldGroup className="grid py-8">
        <Field className="w-full">
          <FieldLabel htmlFor="username">
            Usuario <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
            value={formdata["username"]}
            onChange={e=> onChangeInput("username",e.target.value)}
              id="username"
              placeholder="nombre de usuario"
              name="username"
              required
            />
          </InputGroup>
        </Field>
        <Field className="w-full">
          <FieldLabel htmlFor="password">
            Contraseña <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="password"
              placeholder="ingrese su contraseña "
              name="password"
              required
              type="password"
              value={formdata["password"]}
              onChange={e=> onChangeInput("password",e.target.value)}
            />
          </InputGroup>
        </Field>
      </FieldGroup>
      <div className="mt-1 grid gap-2">
        <Button className="w-full rounded-full">
          Iniciar sesion
        </Button>
        <Button type="button" variant={"ghost"} className="w-full rounded-full">
          Cancelar
        </Button>
      </div>
      </form>
    </div>
  );
}
