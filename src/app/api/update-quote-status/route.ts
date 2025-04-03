import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { quoteId, status } = await request.json();
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Load existing quotes
    const quotesDir = path.join(process.cwd(), 'data', 'quotes');
    const quotesFilePath = path.join(quotesDir, 'quotes.json');
    
    if (!fs.existsSync(quotesFilePath)) {
      return NextResponse.json(
        { error: 'Quotes database not found' },
        { status: 404 }
      );
    }
    
    const quotesData = fs.readFileSync(quotesFilePath, 'utf-8');
    const quotes = JSON.parse(quotesData);
    
    // Find and update the quote
    const quoteIndex = quotes.findIndex((quote: any) => quote.id === quoteId);
    
    if (quoteIndex === -1) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    // Update the quote status
    quotes[quoteIndex].status = status;
    
    // Save updated quotes
    fs.writeFileSync(quotesFilePath, JSON.stringify(quotes, null, 2));
    
    return NextResponse.json({ 
      success: true,
      quoteId,
      status
    });
  } catch (error) {
    console.error('Error updating quote status:', error);
    return NextResponse.json(
      { error: 'Failed to update quote status' },
      { status: 500 }
    );
  }
}
