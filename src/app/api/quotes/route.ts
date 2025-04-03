import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Create quotes directory if it doesn't exist
    const quotesDir = path.join(process.cwd(), 'data', 'quotes');
    if (!fs.existsSync(quotesDir)) {
      fs.mkdirSync(quotesDir, { recursive: true });
    }
    
    // Load existing quotes
    let quotes = [];
    const quotesFilePath = path.join(quotesDir, 'quotes.json');
    
    if (fs.existsSync(quotesFilePath)) {
      const quotesData = fs.readFileSync(quotesFilePath, 'utf-8');
      quotes = JSON.parse(quotesData);
    }
    
    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}
