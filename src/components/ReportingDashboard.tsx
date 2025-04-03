'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

type QuoteData = {
  id: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    preferredDate: string;
    preferredTime: string;
    referralSource: string;
    otherReferral?: string;
  };
  serviceDetails: {
    serviceType: string;
    propertySize: string;
    soilingLevel: string;
    estimatedTime: number;
    cleanersRequired: number;
  };
  costDetails: {
    labourCost: string;
    materialCost: string;
    baseCost: string;
    extrasBreakdown: Array<{name: string; cost: number}>;
    extrasCost: string;
    contractorPrice: string;
    markup: string;
    finalPrice: string;
  };
  additionalInfo: {
    notes?: string;
    siteVisitRequired: boolean;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ReportingDashboard() {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('month');
  const [reportData, setReportData] = useState<any>({
    statusCounts: [],
    serviceTypeCounts: [],
    financialSummary: {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      averageQuoteValue: 0
    },
    timeSeriesData: []
  });
  
  useEffect(() => {
    fetchQuotes();
  }, []);
  
  useEffect(() => {
    if (quotes.length > 0) {
      generateReportData();
    }
  }, [quotes, timeFrame]);
  
  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/quotes');
      if (response.ok) {
        const data = await response.json();
        setQuotes(data.quotes);
      } else {
        console.error('Failed to fetch quotes');
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateReportData = () => {
    // Filter quotes based on time frame
    const filteredQuotes = filterQuotesByTimeFrame(quotes, timeFrame);
    
    // Generate status counts
    const statusCounts = generateStatusCounts(filteredQuotes);
    
    // Generate service type counts
    const serviceTypeCounts = generateServiceTypeCounts(filteredQuotes);
    
    // Generate financial summary
    const financialSummary = generateFinancialSummary(filteredQuotes);
    
    // Generate time series data
    const timeSeriesData = generateTimeSeriesData(quotes, timeFrame);
    
    setReportData({
      statusCounts,
      serviceTypeCounts,
      financialSummary,
      timeSeriesData
    });
  };
  
  const filterQuotesByTimeFrame = (quotes: QuoteData[], timeFrame: string) => {
    const now = new Date();
    const filtered = quotes.filter(quote => {
      const quoteDate = new Date(quote.timestamp);
      
      switch (timeFrame) {
        case 'day':
          return quoteDate.toDateString() === now.toDateString();
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          return quoteDate >= weekStart;
        case 'month':
          return quoteDate.getMonth() === now.getMonth() && 
                 quoteDate.getFullYear() === now.getFullYear();
        case 'quarter':
          const quarterStart = new Date(now);
          quarterStart.setMonth(Math.floor(now.getMonth() / 3) * 3);
          quarterStart.setDate(1);
          const quarterEnd = new Date(quarterStart);
          quarterEnd.setMonth(quarterStart.getMonth() + 3);
          return quoteDate >= quarterStart && quoteDate < quarterEnd;
        case 'year':
          return quoteDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
    
    return filtered;
  };
  
  const generateStatusCounts = (quotes: QuoteData[]) => {
    const counts = {
      pending: 0,
      approved: 0,
      completed: 0,
      cancelled: 0
    };
    
    quotes.forEach(quote => {
      if (counts.hasOwnProperty(quote.status)) {
        counts[quote.status as keyof typeof counts]++;
      }
    });
    
    return Object.entries(counts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };
  
  const generateServiceTypeCounts = (quotes: QuoteData[]) => {
    const counts: Record<string, number> = {};
    
    quotes.forEach(quote => {
      const serviceType = quote.serviceDetails.serviceType;
      counts[serviceType] = (counts[serviceType] || 0) + 1;
    });
    
    return Object.entries(counts).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };
  
  const generateFinancialSummary = (quotes: QuoteData[]) => {
    let totalRevenue = 0;
    let totalCost = 0;
    
    quotes.forEach(quote => {
      if (quote.status === 'completed') {
        const finalPrice = parseFloat(quote.costDetails.finalPrice);
        const contractorPrice = parseFloat(quote.costDetails.contractorPrice);
        
        totalRevenue += finalPrice;
        totalCost += contractorPrice;
      }
    });
    
    const totalProfit = totalRevenue - totalCost;
    const completedQuotes = quotes.filter(q => q.status === 'completed').length;
    const averageQuoteValue = completedQuotes > 0 ? totalRevenue / completedQuotes : 0;
    
    return {
      totalRevenue,
      totalCost,
      totalProfit,
      averageQuoteValue,
      completedQuotes,
      totalQuotes: quotes.length
    };
  };
  
  const generateTimeSeriesData = (quotes: QuoteData[], timeFrame: string) => {
    const data: Record<string, { date: string; quotes: number; revenue: number }> = {};
    
    quotes.forEach(quote => {
      const quoteDate = new Date(quote.timestamp);
      let dateKey = '';
      
      switch (timeFrame) {
        case 'day':
          dateKey = `${quoteDate.getHours()}:00`;
          break;
        case 'week':
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          dateKey = days[quoteDate.getDay()];
          break;
        case 'month':
          dateKey = quoteDate.getDate().toString();
          break;
        case 'quarter':
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          dateKey = monthNames[quoteDate.getMonth()];
          break;
        case 'year':
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          dateKey = months[quoteDate.getMonth()];
          break;
        default:
          dateKey = quoteDate.toISOString().split('T')[0];
      }
      
      if (!data[dateKey]) {
        data[dateKey] = { date: dateKey, quotes: 0, revenue: 0 };
      }
      
      data[dateKey].quotes++;
      
      if (quote.status === 'completed') {
        data[dateKey].revenue += parseFloat(quote.costDetails.finalPrice);
      }
    });
    
    return Object.values(data).sort((a, b) => {
      if (timeFrame === 'week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.indexOf(a.date) - days.indexOf(b.date);
      }
      return a.date.localeCompare(b.date);
    });
  };
  
  const formatCurrency = (value: number) => {
    return `£${value.toFixed(2)}`;
  };
  
  if (isLoading) {
    return <div className="text-center p-8">Loading report data...</div>;
  }
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Reporting Dashboard</h1>
      
      <div className="mb-6">
        <label htmlFor="timeFrame" className="block text-sm font-medium text-gray-700 mb-1">
          Time Frame
        </label>
        <select
          id="timeFrame"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          className="w-full md:w-auto p-2 border rounded-md"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Quotes</h3>
          <p className="text-3xl font-bold">{reportData.financialSummary.totalQuotes}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Completed Quotes</h3>
          <p className="text-3xl font-bold">{reportData.financialSummary.completedQuotes}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Revenue</h3>
          <p className="text-3xl font-bold">{formatCurrency(reportData.financialSummary.totalRevenue)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Profit</h3>
          <p className="text-3xl font-bold">{formatCurrency(reportData.financialSummary.totalProfit)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Quotes by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.statusCounts}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.statusCounts.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} quotes`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Quotes by Service Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.serviceTypeCounts}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.serviceTypeCounts.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} quotes`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Quotes Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={reportData.timeSeriesData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip formatter={(value, name) => {
                if (name === 'revenue') return [formatCurrency(value as number), 'Revenue'];
                return [value, 'Quotes'];
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="quotes" name="Number of Quotes" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <table className="min-w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Total Revenue</td>
                  <td className="py-2 text-right">{formatCurrency(reportData.financialSummary.totalRevenue)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Total Cost</td>
                  <td className="py-2 text-right">{formatCurrency(reportData.financialSummary.totalCost)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Total Profit</td>
                  <td className="py-2 text-right font-bold">{formatCurrency(reportData.financialSummary.totalProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <table className="min-w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Average Quote Value</td>
                  <td className="py-2 text-right">{formatCurrency(reportData.financialSummary.averageQuoteValue)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Completion Rate</td>
                  <td className="py-2 text-right">
                    {reportData.financialSummary.totalQuotes > 0 
                      ? `${((reportData.financialSummary.completedQuotes / reportData.financialSummary.totalQuotes) * 100).toFixed(1)}%` 
                      : '0%'}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Profit Margin</td>
                  <td className="py-2 text-right">
                    {reportData.financialSummary.totalRevenue > 0 
                      ? `${((reportData.financialSummary.totalProfit / reportData.financialSummary.totalRevenue) * 100).toFixed(1)}%` 
                      : '0%'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
