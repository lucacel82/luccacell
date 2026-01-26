import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, ShoppingBag, FileText } from 'lucide-react';
import { SaleForm } from '@/components/SaleForm';
import { SalesList } from '@/components/SalesList';
import { WeeklyReport } from '@/components/WeeklyReport';
import { DailyReport } from '@/components/DailyReport';
import { CashClosing } from '@/components/CashClosing';
import { useSales } from '@/hooks/useSales';

const Index = () => {
  const { sales, loading, addSale, updateSale, deleteSale, getDailyReport, getDailySales, getWeeklyReport } = useSales();
  const [activeTab, setActiveTab] = useState('sales');

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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Daily Report - Fixed at top */}
        <DailyReport report={dailyReport} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-card p-1.5">
            <TabsTrigger 
              value="sales" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Registrar</span> Vendas
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4" />
              Relatório<span className="hidden sm:inline">s</span>
            </TabsTrigger>
            <TabsTrigger 
              value="closing" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
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
