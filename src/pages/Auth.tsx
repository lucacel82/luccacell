import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    await signIn(email, password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    
    await signUp(email, password, fullName);
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-secondary rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-border">
            <Shield className="h-8 w-8 text-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Lucca Cell</h1>
          <p className="text-muted-foreground">Sistema de Vendas</p>
          <div className="mt-4 p-3 glass-card text-center">
            <p className="text-sm text-muted-foreground">
              🔒 <strong className="text-foreground">Agora seguro!</strong> Seus dados estão protegidos.
            </p>
          </div>
        </div>

        <div className="glass-card p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50 rounded-xl p-1">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <LogIn className="h-5 w-5 text-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Entrar na conta</h2>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-foreground">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground">Senha</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="Sua senha"
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="h-5 w-5 text-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Criar conta</h2>
              </div>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-foreground">Nome completo</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    placeholder="Seu nome"
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground">Senha</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Crie uma senha"
                    required
                    minLength={6}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Sistema protegido por autenticação</p>
        </div>
      </div>
    </div>
  );
};
