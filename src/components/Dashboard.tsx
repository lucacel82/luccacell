import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingCart, 
  Target,
  Calendar,
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface ComparisonBadgeProps {
  percentChange: number;
  isPositive: boolean;
  previousValue: number;
  label: string;
}

const ComparisonBadge = ({ percentChange, isPositive, previousValue, label }: ComparisonBadgeProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (previousValue === 0 && percentChange === 0) {
    return (
      <div className="text-xs text-muted-foreground mt-1">
        Sem dados {label}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 mt-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      <span>{isPositive ? '+' : ''}{percentChange.toFixed(1)}%</span>
      <span className="text-muted-foreground ml-1">vs {label}</span>
    </div>
  );
};

export const Dashboard = () => {
  const {
    dailySales,
    categoryData,
    totalMonth,
    totalWeek,
    totalToday,
    salesCount,
    avgTicket,
    loading,
    todayComparison,
    weekComparison,
    monthComparison,
  } = useDashboardData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-2/3 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const barColors = [
    'hsl(45, 93%, 47%)',
    'hsl(45, 80%, 55%)',
    'hsl(45, 70%, 60%)',
    'hsl(45, 60%, 65%)',
    'hsl(45, 50%, 70%)',
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards with Comparisons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card-interactive p-4 group">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 rounded-xl p-2.5 group-hover:bg-primary/30 transition-colors">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">Hoje</p>
              <p className="text-lg font-bold text-foreground truncate">{formatCurrency(totalToday)}</p>
              <ComparisonBadge 
                percentChange={todayComparison.percentChange}
                isPositive={todayComparison.isPositive}
                previousValue={todayComparison.previous}
                label="ontem"
              />
            </div>
          </div>
        </div>

        <div className="glass-card-interactive p-4 group">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 rounded-xl p-2.5 group-hover:bg-primary/30 transition-colors">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">Semana</p>
              <p className="text-lg font-bold text-foreground truncate">{formatCurrency(totalWeek)}</p>
              <ComparisonBadge 
                percentChange={weekComparison.percentChange}
                isPositive={weekComparison.isPositive}
                previousValue={weekComparison.previous}
                label="sem. ant."
              />
            </div>
          </div>
        </div>

        <div className="glass-card-interactive p-4 group">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 rounded-xl p-2.5 group-hover:bg-primary/30 transition-colors">
              {monthComparison.isPositive ? (
                <TrendingUp className="h-5 w-5 text-primary" />
              ) : (
                <TrendingDown className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">Mês</p>
              <p className="text-lg font-bold text-foreground truncate">{formatCurrency(totalMonth)}</p>
              <ComparisonBadge 
                percentChange={monthComparison.percentChange}
                isPositive={monthComparison.isPositive}
                previousValue={monthComparison.previous}
                label="mês ant."
              />
            </div>
          </div>
        </div>

        <div className="glass-card-interactive p-4 group">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 rounded-xl p-2.5 group-hover:bg-primary/30 transition-colors">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">Ticket Médio</p>
              <p className="text-lg font-bold text-foreground truncate">{formatCurrency(avgTicket)}</p>
              <div className="text-xs text-muted-foreground mt-1">
                {salesCount} vendas
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Cards - Detailed View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Hoje vs Ontem</span>
            <div className={`flex items-center gap-1 text-sm font-medium ${todayComparison.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {todayComparison.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {todayComparison.percentChange.toFixed(1)}%
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Hoje</span>
              <span className="text-sm font-semibold text-foreground">{formatCurrency(todayComparison.current)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Ontem</span>
              <span className="text-sm text-muted-foreground">{formatCurrency(todayComparison.previous)}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${todayComparison.isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ 
                  width: `${Math.min(100, Math.max(0, todayComparison.previous > 0 ? (todayComparison.current / todayComparison.previous) * 50 : todayComparison.current > 0 ? 100 : 0))}%` 
                }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Esta Semana vs Anterior</span>
            <div className={`flex items-center gap-1 text-sm font-medium ${weekComparison.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {weekComparison.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {weekComparison.percentChange.toFixed(1)}%
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Esta semana</span>
              <span className="text-sm font-semibold text-foreground">{formatCurrency(weekComparison.current)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Semana anterior</span>
              <span className="text-sm text-muted-foreground">{formatCurrency(weekComparison.previous)}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${weekComparison.isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ 
                  width: `${Math.min(100, Math.max(0, weekComparison.previous > 0 ? (weekComparison.current / weekComparison.previous) * 50 : weekComparison.current > 0 ? 100 : 0))}%` 
                }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Este Mês vs Anterior</span>
            <div className={`flex items-center gap-1 text-sm font-medium ${monthComparison.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {monthComparison.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {monthComparison.percentChange.toFixed(1)}%
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Este mês</span>
              <span className="text-sm font-semibold text-foreground">{formatCurrency(monthComparison.current)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Mês anterior</span>
              <span className="text-sm text-muted-foreground">{formatCurrency(monthComparison.previous)}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${monthComparison.isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ 
                  width: `${Math.min(100, Math.max(0, monthComparison.previous > 0 ? (monthComparison.current / monthComparison.previous) * 50 : monthComparison.current > 0 ? 100 : 0))}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart - Daily Sales */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Vendas dos Últimos 7 Dias</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(0, 0%, 50%)"
                  tick={{ fill: 'hsl(0, 0%, 70%)', fontSize: 12 }}
                />
                <YAxis 
                  stroke="hsl(0, 0%, 50%)"
                  tick={{ fill: 'hsl(0, 0%, 70%)', fontSize: 12 }}
                  tickFormatter={(value) => formatShortCurrency(value)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 8%)',
                    border: '1px solid hsl(0, 0%, 20%)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                  labelStyle={{ color: 'hsl(0, 0%, 70%)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Total']}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(45, 93%, 47%)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Top Products */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Top 5 Produtos</h3>
          </div>
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={categoryData} 
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                  <XAxis 
                    type="number" 
                    stroke="hsl(0, 0%, 50%)"
                    tick={{ fill: 'hsl(0, 0%, 70%)', fontSize: 12 }}
                    tickFormatter={(value) => formatShortCurrency(value)}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="hsl(0, 0%, 50%)"
                    tick={{ fill: 'hsl(0, 0%, 70%)', fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 8%)',
                      border: '1px solid hsl(0, 0%, 20%)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    }}
                    labelStyle={{ color: 'hsl(0, 0%, 70%)' }}
                    formatter={(value: number, name: string, props: any) => [
                      `${formatCurrency(value)} (${props.payload.count} un.)`,
                      'Vendas'
                    ]}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  Nenhum produto vendido neste mês ainda.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Resumo do Mês</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Total de Vendas</p>
            <p className="text-2xl font-bold text-foreground">{salesCount}</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Faturamento</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalMonth)}</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 col-span-2 md:col-span-1">
            <p className="text-sm text-muted-foreground">Ticket Médio</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(avgTicket)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
