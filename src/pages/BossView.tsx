import { Dashboard } from '@/components/Dashboard';
import { WeeklyReport } from '@/components/WeeklyReport';
import { useSales } from '@/hooks/useSales';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, BarChart3 } from 'lucide-react';

const BossView = () => {
  const { getWeeklyReport } = useSales();
  const weeklyReport = getWeeklyReport();

  return (
    <div className="min-h-screen bg-background">
      <div className="glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img
                src="/lovable-uploads/6bfd736e-2813-4131-a5a5-76c6df038df8.png"
                alt="Lucca Cell Logo"
                className="h-16 w-auto object-contain rounded-2xl"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                Lucca Cell — Painel Gerencial
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Visão geral de vendas e relatórios
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-card p-1.5">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <WeeklyReport report={weeklyReport} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BossView;
