'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function QuoteTracker() {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  
  useEffect(() => {
    fetchQuotes();
  }, []);
  
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
  
  const updateQuoteStatus = async (quoteId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/update-quote-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteId, status: newStatus }),
      });
      
      if (response.ok) {
        // Update local state
        setQuotes(quotes.map(quote => 
          quote.id === quoteId 
            ? { ...quote, status: newStatus as 'pending' | 'approved' | 'completed' | 'cancelled' } 
            : quote
        ));
      } else {
        console.error('Failed to update quote status');
      }
    } catch (error) {
      console.error('Error updating quote status:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB');
  };
  
  const filteredQuotes = quotes.filter(quote => {
    // Apply status filter
    if (filter !== 'all' && quote.status !== filter) {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        quote.id.toLowerCase().includes(searchLower) ||
        quote.customerDetails.name.toLowerCase().includes(searchLower) ||
        quote.customerDetails.email.toLowerCase().includes(searchLower) ||
        quote.customerDetails.phone.toLowerCase().includes(searchLower) ||
        quote.serviceDetails.serviceType.toLowerCase().includes(searchLower) ||
        quote.serviceDetails.propertySize.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Sort quotes
  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    let aValue, bValue;
    
    // Determine values to compare based on sort field
    switch (sortField) {
      case 'timestamp':
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
        break;
      case 'customerName':
        aValue = a.customerDetails.name;
        bValue = b.customerDetails.name;
        break;
      case 'serviceType':
        aValue = a.serviceDetails.serviceType;
        bValue = b.serviceDetails.serviceType;
        break;
      case 'finalPrice':
        aValue = parseFloat(a.costDetails.finalPrice);
        bValue = parseFloat(b.costDetails.finalPrice);
        break;
      default:
        aValue = a.timestamp;
        bValue = b.timestamp;
    }
    
    // Apply sort direction
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  const handleSort = (field: string) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  if (isLoading) {
    return <div className="text-center p-8">Loading quotes...</div>;
  }
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Quote Tracker</h1>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-auto p-2 border rounded-md"
            >
              <option value="all">All Quotes</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quotes..."
              className="w-full md:w-64 p-2 border rounded-md"
            />
          </div>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={fetchQuotes}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Quotes
          </button>
        </div>
      </div>
      
      {sortedQuotes.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p>No quotes found matching your criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th 
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('timestamp')}
                >
                  Date/Time
                  {sortField === 'timestamp' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-4 py-2 text-left">Quote ID</th>
                <th 
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('customerName')}
                >
                  Customer
                  {sortField === 'customerName' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('serviceType')}
                >
                  Service
                  {sortField === 'serviceType' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-4 py-2 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('finalPrice')}
                >
                  Price
                  {sortField === 'finalPrice' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedQuotes.map((quote) => (
                <tr key={quote.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{formatDate(quote.timestamp)}</td>
                  <td className="px-4 py-2">{quote.id}</td>
                  <td className="px-4 py-2">
                    <div>{quote.customerDetails.name}</div>
                    <div className="text-sm text-gray-500">{quote.customerDetails.email}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div>{quote.serviceDetails.serviceType}</div>
                    <div className="text-sm text-gray-500">{quote.serviceDetails.propertySize}</div>
                  </td>
                  <td className="px-4 py-2 font-medium">£{quote.costDetails.finalPrice}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                      quote.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/quotes/${quote.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Link>
                      <div className="relative group">
                        <button className="text-gray-600 hover:text-gray-800">
                          Status ▼
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                          <div className="py-1">
                            <button
                              onClick={() => updateQuoteStatus(quote.id, 'pending')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Mark as Pending
                            </button>
                            <button
                              onClick={() => updateQuoteStatus(quote.id, 'approved')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Mark as Approved
                            </button>
                            <button
                              onClick={() => updateQuoteStatus(quote.id, 'completed')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Mark as Completed
                            </button>
                            <button
                              onClick={() => updateQuoteStatus(quote.id, 'cancelled')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Mark as Cancelled
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>Total Quotes: {quotes.length} | Filtered Quotes: {sortedQuotes.length}</p>
      </div>
    </div>
  );
}
