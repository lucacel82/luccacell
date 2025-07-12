import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, BarChart3, ShoppingBag } from 'lucide-react';
import { SaleForm } from '@/components/SaleForm';
import { SalesList } from '@/components/SalesList';
import { WeeklyReport } from '@/components/WeeklyReport';
import { useSales } from '@/hooks/useSales';

const Index = () => {
  const { sales, addSale, updateSale, deleteSale, getWeeklyReport } = useSales();
  const [activeTab, setActiveTab] = useState('sales');

  const weeklyReport = getWeeklyReport();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-dark border-b border-border shadow-dark">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-gold rounded-lg p-3">
              <Smartphone className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">
                Lucca Cell
              </h1>
              <p className="text-muted-foreground">Sistema de Controle de Vendas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary border border-border">
            <TabsTrigger 
              value="sales" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Registrar</span> Vendas
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              Relatório <span className="hidden sm:inline">Semanal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6 mt-6">
            <SaleForm onSubmit={addSale} />
            <SalesList 
              sales={sales} 
              onUpdate={updateSale} 
              onDelete={deleteSale} 
            />
          </TabsContent>

          <TabsContent value="report" className="mt-6">
            <WeeklyReport report={weeklyReport} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
