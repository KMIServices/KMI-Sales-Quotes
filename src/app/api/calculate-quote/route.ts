import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define types for pricing data
type PricingData = {
  'Service Type': string;
  'Property Size': string;
  'Estimated Time (hrs)': number;
  'Cleaners Required': number;
  'Labour Cost (£)': number;
  'Material Cost (£)': number;
  'Base Cost (£)': number;
  'Final Price (£)': number;
  'Optional Extras'?: string;
  'Soiling Level'?: string;
  'Optional Extra'?: string;
  'Extra Cost (£)'?: number;
  'Final Price with Extra (£)'?: number;
}

// Define types for the request body
type RequestBody = {
  serviceType: string;
  propertySize: string;
  soilingLevel: 'Light' | 'Medium' | 'Heavy';
  extras: {
    ovenCleaning: boolean;
    fridgeCleaning: boolean;
    microwaveCleaning: boolean;
    carpetCleaning: boolean;
    carpetRooms: number;
    stairsCarpetCleaning: boolean;
    windowCleaning: boolean;
    windowCount: number;
    mouldCleaning: boolean;
    mouldRooms: number;
  };
}

// Define types for the response
type QuoteResponse = {
  serviceType: string;
  propertySize: string;
  soilingLevel: string;
  estimatedTime: number;
  cleanersRequired: number;
  labourCost: string;
  materialCost: string;
  baseCost: string;
  extrasBreakdown: Array<{name: string; cost: number}>;
  extrasCost: string;
  contractorPrice: string;
  markup: string;
  finalPrice: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    
    // Load pricing data
    const pricingDataPath = path.join(process.cwd(), 'public', 'pricing_data.json');
    const pricingDataRaw = fs.readFileSync(pricingDataPath, 'utf-8');
    const pricingData: PricingData[] = JSON.parse(pricingDataRaw);
    
    // Find matching pricing data
    const matchingData = pricingData.find(item => 
      item['Service Type'] === body.serviceType && 
      item['Property Size'] === body.propertySize
    );
    
    if (!matchingData) {
      return NextResponse.json(
        { error: 'No matching pricing data found' },
        { status: 404 }
      );
    }
    
    // Calculate base costs
    let labourCost = matchingData['Labour Cost (£)'];
    const materialCost = matchingData['Material Cost (£)'];
    const estimatedTime = matchingData['Estimated Time (hrs)'];
    const cleanersRequired = matchingData['Cleaners Required'];
    
    // Adjust for soiling level
    if (body.soilingLevel === 'Medium') {
      labourCost *= 1.15; // 15% increase for medium soiling
    } else if (body.soilingLevel === 'Heavy') {
      labourCost *= 1.3; // 30% increase for heavy soiling
    }
    
    // Calculate extras cost
    let extrasCost = 0;
    const extrasBreakdown: Array<{name: string; cost: number}> = [];
    
    if (body.extras.ovenCleaning) {
      extrasCost += 20;
      extrasBreakdown.push({ name: 'Oven Cleaning', cost: 20 });
    }
    
    if (body.extras.fridgeCleaning) {
      extrasCost += 10;
      extrasBreakdown.push({ name: 'Fridge Cleaning', cost: 10 });
    }
    
    if (body.extras.microwaveCleaning) {
      extrasCost += 5;
      extrasBreakdown.push({ name: 'Microwave Cleaning', cost: 5 });
    }
    
    if (body.extras.carpetCleaning && body.extras.carpetRooms > 0) {
      const carpetCost = 15 * body.extras.carpetRooms;
      extrasCost += carpetCost;
      extrasBreakdown.push({ name: `Carpet Cleaning (${body.extras.carpetRooms} rooms)`, cost: carpetCost });
    }
    
    if (body.extras.stairsCarpetCleaning) {
      extrasCost += 10;
      extrasBreakdown.push({ name: 'Stairs Carpet Cleaning', cost: 10 });
    }
    
    if (body.extras.windowCleaning && body.extras.windowCount > 0) {
      const windowCost = 3 * body.extras.windowCount;
      extrasCost += windowCost;
      extrasBreakdown.push({ name: `Window Cleaning (${body.extras.windowCount} windows)`, cost: windowCost });
    }
    
    if (body.extras.mouldCleaning && body.extras.mouldRooms > 0) {
      // Assuming £25 per room for mould cleaning
      const mouldCost = 25 * body.extras.mouldRooms;
      extrasCost += mouldCost;
      extrasBreakdown.push({ name: `Mould Cleaning (${body.extras.mouldRooms} rooms)`, cost: mouldCost });
    }
    
    // Calculate final prices
    const baseCost = labourCost + materialCost;
    const contractorPrice = baseCost + extrasCost;
    const markup = contractorPrice * 0.3; // 30% markup
    const finalPrice = contractorPrice + markup;
    
    // Prepare response
    const quoteResponse: QuoteResponse = {
      serviceType: body.serviceType,
      propertySize: body.propertySize,
      soilingLevel: body.soilingLevel,
      estimatedTime,
      cleanersRequired,
      labourCost: labourCost.toFixed(2),
      materialCost: materialCost.toFixed(2),
      baseCost: baseCost.toFixed(2),
      extrasBreakdown,
      extrasCost: extrasCost.toFixed(2),
      contractorPrice: contractorPrice.toFixed(2),
      markup: markup.toFixed(2),
      finalPrice: finalPrice.toFixed(2)
    };
    
    return NextResponse.json(quoteResponse);
  } catch (error) {
    console.error('Error calculating quote:', error);
    return NextResponse.json(
      { error: 'Failed to calculate quote' },
      { status: 500 }
    );
  }
}
