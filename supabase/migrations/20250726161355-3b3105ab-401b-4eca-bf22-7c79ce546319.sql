-- Crear la tabla mcp_business
CREATE TABLE public.mcp_business (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    nombre_empresa TEXT,
    descripcion TEXT
);

-- Crear la tabla mcp_clients
CREATE TABLE public.mcp_clients (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    nombre_cliente TEXT,
    motivo_contacto TEXT,
    tipo_requerimiento TEXT,
    nivel_satisfaccion INTEGER CHECK (nivel_satisfaccion >= 1 AND nivel_satisfaccion <= 10),
    client_id TEXT,
    business_id INTEGER NOT NULL REFERENCES public.mcp_business(id) ON DELETE CASCADE
);

-- Habilitar RLS en ambas tablas
ALTER TABLE public.mcp_business ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_clients ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mcp_business (solo administradores pueden ver/gestionar)
CREATE POLICY "Solo administradores pueden ver empresas" 
ON public.mcp_business 
FOR SELECT 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Solo administradores pueden insertar empresas" 
ON public.mcp_business 
FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Solo administradores pueden actualizar empresas" 
ON public.mcp_business 
FOR UPDATE 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Solo administradores pueden eliminar empresas" 
ON public.mcp_business 
FOR DELETE 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas RLS para mcp_clients (solo administradores pueden ver/gestionar)
CREATE POLICY "Solo administradores pueden ver clientes" 
ON public.mcp_clients 
FOR SELECT 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Solo administradores pueden insertar clientes" 
ON public.mcp_clients 
FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Solo administradores pueden actualizar clientes" 
ON public.mcp_clients 
FOR UPDATE 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Solo administradores pueden eliminar clientes" 
ON public.mcp_clients 
FOR DELETE 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

-- Insertar datos de ejemplo
INSERT INTO public.mcp_business (nombre_empresa, descripcion) VALUES 
('TechSolutions', 'Empresa de soluciones tecnológicas'),
('DataCorp', 'Corporación de análisis de datos');

INSERT INTO public.mcp_clients (nombre_cliente, motivo_contacto, tipo_requerimiento, nivel_satisfaccion, client_id, business_id) VALUES 
('Juan Pérez', 'Consulta técnica', 'Soporte técnico', 8, 'client_001', 1),
('María García', 'Solicitud de información', 'Información de productos', 9, 'client_002', 1),
('Carlos López', 'Problema con servicio', 'Soporte técnico', 6, 'client_003', 1),
('Ana Martínez', 'Consulta comercial', 'Ventas', 10, 'client_004', 1),
('Pedro González', 'Reporte de bug', 'Soporte técnico', 7, 'client_005', 1),
('Lucía Fernández', 'Solicitud de presupuesto', 'Ventas', 8, 'client_006', 1),
('Roberto Silva', 'Consulta técnica', 'Soporte técnico', 9, 'client_007', 1);