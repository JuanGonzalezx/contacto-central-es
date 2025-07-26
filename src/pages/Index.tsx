import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tertiary-gray">
        <div className="text-primary-orange font-heading text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tertiary-gray p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-heading text-primary-orange mb-2">
            Contacto Central
          </CardTitle>
          <p className="text-text-gray">
            Sistema de gestión de contactos empresariales
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <>
              <p className="text-text-dark">
                Accede al panel de administración para gestionar los contactos de tus clientes.
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full bg-primary-orange hover:bg-primary-orange/90"
              >
                Acceder al Panel
              </Button>
            </>
          ) : (
            <>
              <p className="text-text-dark">
                Bienvenido, {user.email}
              </p>
              {isAdmin ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-primary-orange hover:bg-primary-orange/90"
                >
                  Ir al Dashboard
                </Button>
              ) : (
                <p className="text-text-gray">
                  Tu cuenta no tiene permisos de administrador.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
