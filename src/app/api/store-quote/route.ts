import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define types for the quote data
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

export async function POST(request: NextRequest) {
  try {
    const { formData, quoteDetails } = await request.json();
    
    // Generate a unique ID for the quote
    const quoteId = `KMI-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Create quote data object
    const quoteData: QuoteData = {
      id: quoteId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      customerDetails: {
        name: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        referralSource: formData.referralSource,
        otherReferral: formData.otherReferral
      },
      serviceDetails: {
        serviceType: quoteDetails.serviceType,
        propertySize: quoteDetails.propertySize,
        soilingLevel: quoteDetails.soilingLevel,
        estimatedTime: quoteDetails.estimatedTime,
        cleanersRequired: quoteDetails.cleanersRequired
      },
      costDetails: {
        labourCost: quoteDetails.labourCost,
        materialCost: quoteDetails.materialCost,
        baseCost: quoteDetails.baseCost,
        extrasBreakdown: quoteDetails.extrasBreakdown,
        extrasCost: quoteDetails.extrasCost,
        contractorPrice: quoteDetails.contractorPrice,
        markup: quoteDetails.markup,
        finalPrice: quoteDetails.finalPrice
      },
      additionalInfo: {
        notes: formData.additionalNotes,
        siteVisitRequired: formData.siteVisitRequired
      }
    };
    
    // Create quotes directory if it doesn't exist
    const quotesDir = path.join(process.cwd(), 'data', 'quotes');
    if (!fs.existsSync(quotesDir)) {
      fs.mkdirSync(quotesDir, { recursive: true });
    }
    
    // Load existing quotes
    let quotes: QuoteData[] = [];
    const quotesFilePath = path.join(quotesDir, 'quotes.json');
    
    if (fs.existsSync(quotesFilePath)) {
      const quotesData = fs.readFileSync(quotesFilePath, 'utf-8');
      quotes = JSON.parse(quotesData);
    }
    
    // Add new quote
    quotes.push(quoteData);
    
    // Save updated quotes
    fs.writeFileSync(quotesFilePath, JSON.stringify(quotes, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      quoteId: quoteId 
    });
  } catch (error) {
    console.error('Error storing quote:', error);
    return NextResponse.json(
      { error: 'Failed to store quote' },
      { status: 500 }
    );
  }
}
