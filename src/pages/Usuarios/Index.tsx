export default function Usuarios() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded shadow">
          Nuevo Usuario
        </button>
      </div>
      
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <p>Aquí irá tu tabla de Drizzle cargada desde SQLite...</p>
      </div>
    </div>
  );
}