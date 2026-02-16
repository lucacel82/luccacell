import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, ShoppingBag, FileText, LayoutDashboard, Package, LogOut, Settings } from 'lucide-react';
import { SaleForm } from '@/components/SaleForm';
import { SalesList } from '@/components/SalesList';
import { WeeklyReport } from '@/components/WeeklyReport';
import { DailyReport } from '@/components/DailyReport';
import { CashClosing } from '@/components/CashClosing';
import { Dashboard } from '@/components/Dashboard';
import { Products } from '@/components/Products';
import { PrinterSettings } from '@/components/PrinterSettings';
import { useSales } from '@/hooks/useSales';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { sales, loading, addSale, updateSale, deleteSale, getDailyReport, getDailySales, getWeeklyReport } = useSales();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, signOut } = useAuth();

  const dailyReport = getDailyReport();
  const dailySales = getDailySales();
  const weeklyReport = getWeeklyReport();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                Sistema de Controle de Vendas
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Assistência Técnica & Acessórios
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Daily Report - Fixed at top */}
        <DailyReport report={dailyReport} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 glass-card p-1.5">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sales" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Vendas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="closing" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Caixa</span>
            </TabsTrigger>
            <TabsTrigger 
              value="config" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <Dashboard />
          </TabsContent>

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

          <TabsContent value="products" className="mt-6">
            <Products />
          </TabsContent>

          <TabsContent value="closing" className="mt-6">
            <CashClosing 
              dailySales={dailySales} 
              dailyTotal={dailyReport.totalValue} 
            />
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <PrinterSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
