import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart3, ShoppingBag, FileText, LogOut, User } from 'lucide-react';
import { SaleForm } from '@/components/SaleForm';
import { SalesList } from '@/components/SalesList';
import { WeeklyReport } from '@/components/WeeklyReport';
import { DailyReport } from '@/components/DailyReport';
import { CashClosing } from '@/components/CashClosing';
import { useSales } from '@/hooks/useSales';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { sales, loading, addSale, updateSale, deleteSale, getDailyReport, getDailySales, getWeeklyReport } = useSales();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('sales');

  const dailyReport = getDailyReport();
  const dailySales = getDailySales();
  const weeklyReport = getWeeklyReport();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-dark border-b border-border shadow-dark">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/6bfd736e-2813-4131-a5a5-76c6df038df8.png" 
                alt="Lucca Cell Logo" 
                className="h-16 w-auto object-contain rounded-xl"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-primary truncate font-poppins">
                Sistema de Controle de Vendas
              </h1>
              <p className="text-sm md:text-base text-muted-foreground font-poppins">
                Assistência Técnica & Acessórios
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="border-border/50 hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Daily Report - Fixed at top */}
        <DailyReport report={dailyReport} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 border border-border/50 rounded-xl backdrop-blur-sm">
            <TabsTrigger 
              value="sales" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground rounded-lg font-poppins"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Registrar</span> Vendas
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground rounded-lg font-poppins"
            >
              <BarChart3 className="h-4 w-4" />
              Relatório<span className="hidden sm:inline">s</span>
            </TabsTrigger>
            <TabsTrigger 
              value="closing" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground rounded-lg font-poppins"
            >
              <FileText className="h-4 w-4" />
              Fechar <span className="hidden sm:inline">Caixa</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6 mt-6">
            <SaleForm onSubmit={addSale} />
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando vendas...</p>
              </div>
            ) : (
              <SalesList 
                sales={sales} 
                onUpdate={updateSale} 
                onDelete={deleteSale} 
              />
            )}
          </TabsContent>

          <TabsContent value="report" className="mt-6">
            <WeeklyReport report={weeklyReport} />
          </TabsContent>

          <TabsContent value="closing" className="mt-6">
            <CashClosing 
              dailySales={dailySales} 
              dailyTotal={dailyReport.totalValue} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
