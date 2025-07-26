import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { LogOut } from 'lucide-react';

interface ClientData {
  id: number;
  created_at: string;
  nombre_cliente: string;
  motivo_contacto: string;
  tipo_requerimiento: string;
  nivel_satisfaccion: number;
  client_id: string;
  business_id: number;
}

const Dashboard = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user && isAdmin) {
      fetchClients();
    }
  }, [user, isAdmin]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('mcp_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tertiary-gray">
        <div className="text-primary-orange font-heading text-xl">Cargando dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tertiary-gray">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-primary-orange">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-gray mb-4">
              Solo los administradores pueden acceder a este panel.
            </p>
            <Button onClick={signOut} className="bg-primary-orange hover:bg-primary-orange/90">
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular estadísticas
  const today = new Date().toISOString().split('T')[0];
  const contactosHoy = clients.filter(client => 
    client.created_at.split('T')[0] === today
  ).length;

  // Top 7 motivos de contacto
  const motivosCount = clients.reduce((acc, client) => {
    acc[client.tipo_requerimiento] = (acc[client.tipo_requerimiento] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topMotivos = Object.entries(motivosCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 7)
    .map(([motivo, count], index) => ({
      name: motivo,
      value: count,
      fill: `hsl(var(--chart-${(index % 7) + 1}))`
    }));

  // Pregunta más frecuente
  const preguntaMasFrecuente = topMotivos[0]?.name || 'Sin datos';

  // Datos de satisfacción
  const satisfaccionData = Array.from({ length: 10 }, (_, i) => {
    const nivel = i + 1;
    const count = clients.filter(client => client.nivel_satisfaccion === nivel).length;
    return {
      nivel,
      cantidad: count
    };
  });

  // Datos de contactos por día (últimos 7 días)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const contactosPorDia = last7Days.map(date => {
    const count = clients.filter(client => 
      client.created_at.split('T')[0] === date
    ).length;
    return {
      fecha: new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
      contactos: count
    };
  });

  const formatNumber = (num: number) => {
    return num.toLocaleString('es-ES');
  };

  return (
    <div className="min-h-screen bg-tertiary-gray p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary-orange">
              Dashboard de Contactos
            </h1>
            <p className="text-text-gray mt-2">Panel de gestión de contactos de clientes</p>
          </div>
          <Button 
            onClick={signOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-gray">
                Contactos del Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-orange font-heading">
                {formatNumber(contactosHoy)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-gray">
                Total Contactos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-orange font-heading">
                {formatNumber(clients.length)}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-gray">
                Pregunta Más Frecuente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-text-dark">
                {preguntaMasFrecuente}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Dashboard de Entrada por Plataforma */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-text-dark">
                Dashboard de Entrada por Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topMotivos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topMotivos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Satisfacción del Usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-text-dark">
                Satisfacción del Usuario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={satisfaccionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nivel" 
                    domain={[0, 10]}
                    type="number"
                    scale="linear"
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatNumber(value as number), 'Cantidad de usuarios']}
                  />
                  <Bar dataKey="cantidad" fill="hsl(var(--primary-orange))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de línea */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-text-dark">
              Contactos por Día (Últimos 7 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={contactosPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatNumber(value as number), 'Contactos']}
                />
                <Line 
                  type="monotone" 
                  dataKey="contactos" 
                  stroke="hsl(var(--primary-orange))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary-orange))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;