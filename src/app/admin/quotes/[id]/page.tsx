'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function QuoteDetail() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;
  
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchQuoteDetails();
  }, [quoteId]);
  
  const fetchQuoteDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/quotes');
      if (response.ok) {
        const data = await response.json();
        const foundQuote = data.quotes.find((q: QuoteData) => q.id === quoteId);
        
        if (foundQuote) {
          setQuote(foundQuote);
        } else {
          setError('Quote not found');
        }
      } else {
        setError('Failed to fetch quote details');
      }
    } catch (error) {
      console.error('Error fetching quote details:', error);
      setError('An error occurred while fetching quote details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateQuoteStatus = async (newStatus: string) => {
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
        if (quote) {
          setQuote({
            ...quote,
            status: newStatus as 'pending' | 'approved' | 'completed' | 'cancelled'
          });
        }
      } else {
        setError('Failed to update quote status');
      }
    } catch (error) {
      console.error('Error updating quote status:', error);
      setError('An error occurred while updating quote status');
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };
  
  const formatTime = (timeString: string) => {
    return timeString;
  };
  
  if (isLoading) {
    return <div className="text-center p-8">Loading quote details...</div>;
  }
  
  if (error || !quote) {
    return (
      <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow">
        <div className="text-center p-8 bg-red-50 rounded-md">
          <p className="text-red-600">{error || 'Quote not found'}</p>
          <Link href="/admin/quotes" className="mt-4 inline-block text-blue-600 hover:underline">
            Return to Quote List
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quote Details</h1>
        <Link href="/admin/quotes" className="text-blue-600 hover:underline">
          Back to Quote List
        </Link>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Quote ID: {quote.id}</h2>
            <p className="text-gray-600">Created: {new Date(quote.timestamp).toLocaleString('en-GB')}</p>
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              quote.status === 'approved' ? 'bg-green-100 text-green-800' :
              quote.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Customer Details</h3>
          <div className="space-y-2">
            <p><strong>Name:</strong> {quote.customerDetails.name}</p>
            <p><strong>Email:</strong> {quote.customerDetails.email}</p>
            <p><strong>Phone:</strong> {quote.customerDetails.phone}</p>
            <p><strong>Address:</strong> {quote.customerDetails.address}</p>
            <p><strong>Preferred Date:</strong> {formatDate(quote.customerDetails.preferredDate)}</p>
            <p><strong>Preferred Time:</strong> {formatTime(quote.customerDetails.preferredTime)}</p>
            <p>
              <strong>Referral Source:</strong> {quote.customerDetails.referralSource}
              {quote.customerDetails.otherReferral && ` - ${quote.customerDetails.otherReferral}`}
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Service Details</h3>
          <div className="space-y-2">
            <p><strong>Service Type:</strong> {quote.serviceDetails.serviceType}</p>
            <p><strong>Property Size:</strong> {quote.serviceDetails.propertySize}</p>
            <p><strong>Soiling Level:</strong> {quote.serviceDetails.soilingLevel}</p>
            <p><strong>Estimated Time:</strong> {quote.serviceDetails.estimatedTime} hours</p>
            <p><strong>Cleaners Required:</strong> {quote.serviceDetails.cleanersRequired}</p>
            <p><strong>Site Visit Required:</strong> {quote.additionalInfo.siteVisitRequired ? 'Yes' : 'No'}</p>
            {quote.additionalInfo.notes && (
              <div>
                <p><strong>Additional Notes:</strong></p>
                <p className="bg-white p-2 rounded">{quote.additionalInfo.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold mb-3">Cost Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Labour Cost:</strong> £{quote.costDetails.labourCost}</p>
            <p><strong>Material Cost:</strong> £{quote.costDetails.materialCost}</p>
            <p><strong>Base Cost:</strong> £{quote.costDetails.baseCost}</p>
            
            {quote.costDetails.extrasBreakdown.length > 0 && (
              <div className="mt-3">
                <p><strong>Selected Extras:</strong></p>
                <ul className="list-disc pl-5">
                  {quote.costDetails.extrasBreakdown.map((extra, index) => (
                    <li key={index}>{extra.name}: £{extra.cost.toFixed(2)}</li>
                  ))}
                </ul>
                <p><strong>Extras Total:</strong> £{quote.costDetails.extrasCost}</p>
              </div>
            )}
          </div>
          
          <div>
            <p><strong>Contractor Price:</strong> £{quote.costDetails.contractorPrice}</p>
            <p><strong>30% Markup:</strong> £{quote.costDetails.markup}</p>
            <p className="text-lg font-bold mt-2">
              <strong>Final Price:</strong> £{quote.costDetails.finalPrice}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h3 className="text-lg font-semibold mb-3">Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => updateQuoteStatus('pending')}
            className={`px-4 py-2 rounded-md ${
              quote.status === 'pending' 
                ? 'bg-yellow-200 text-yellow-800' 
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
            disabled={quote.status === 'pending'}
          >
            Mark as Pending
          </button>
          
          <button
            onClick={() => updateQuoteStatus('approved')}
            className={`px-4 py-2 rounded-md ${
              quote.status === 'approved' 
                ? 'bg-green-200 text-green-800' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
            disabled={quote.status === 'approved'}
          >
            Mark as Approved
          </button>
          
          <button
            onClick={() => updateQuoteStatus('completed')}
            className={`px-4 py-2 rounded-md ${
              quote.status === 'completed' 
                ? 'bg-blue-200 text-blue-800' 
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
            disabled={quote.status === 'completed'}
          >
            Mark as Completed
          </button>
          
          <button
            onClick={() => updateQuoteStatus('cancelled')}
            className={`px-4 py-2 rounded-md ${
              quote.status === 'cancelled' 
                ? 'bg-red-200 text-red-800' 
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
            disabled={quote.status === 'cancelled'}
          >
            Mark as Cancelled
          </button>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => window.print()}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Print Quote
        </button>
        
        <button
          onClick={() => {
            // In a real implementation, this would send an email to the customer
            alert('Email sent to customer!');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Email to Customer
        </button>
      </div>
    </div>
  );
}
