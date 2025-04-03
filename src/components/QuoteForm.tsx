'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  // Customer Details
  customerName: string;
  address: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  referralSource: string;
  otherReferral?: string;
  
  // Service Requirements
  serviceType: string;
  propertySize: string;
  soilingLevel: 'Light' | 'Medium' | 'Heavy';
  
  // Optional Extras
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
  
  // Additional Information
  additionalNotes: string;
  siteVisitRequired: boolean;
};

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

export default function QuoteForm() {
  const [pricingData, setPricingData] = useState<PricingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  const [showQuote, setShowQuote] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      serviceType: 'Regular Domestic Cleaning',
      soilingLevel: 'Light',
      carpetRooms: 0,
      windowCount: 0,
      mouldRooms: 0,
    }
  });
  
  const watchServiceType = watch('serviceType');
  const watchPropertySize = watch('propertySize');
  const watchSoilingLevel = watch('soilingLevel');
  const watchCarpetCleaning = watch('carpetCleaning');
  const watchCarpetRooms = watch('carpetRooms');
  const watchWindowCleaning = watch('windowCleaning');
  const watchWindowCount = watch('windowCount');
  const watchMouldCleaning = watch('mouldCleaning');
  const watchMouldRooms = watch('mouldRooms');
  const watchOvenCleaning = watch('ovenCleaning');
  const watchFridgeCleaning = watch('fridgeCleaning');
  const watchMicrowaveCleaning = watch('microwaveCleaning');
  const watchStairsCarpetCleaning = watch('stairsCarpetCleaning');
  const watchReferralSource = watch('referralSource');
  
  useEffect(() => {
    // Load pricing data from JSON file
    fetch('/pricing_data.json')
      .then(response => response.json())
      .then(data => {
        setPricingData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading pricing data:', error);
        setIsLoading(false);
      });
  }, []);
  
  // Calculate quote when form values change
  useEffect(() => {
    if (!isLoading && watchServiceType && watchPropertySize && watchSoilingLevel) {
      calculateQuote();
    }
  }, [
    isLoading, 
    watchServiceType, 
    watchPropertySize, 
    watchSoilingLevel,
    watchCarpetCleaning,
    watchCarpetRooms,
    watchWindowCleaning,
    watchWindowCount,
    watchMouldCleaning,
    watchMouldRooms,
    watchOvenCleaning,
    watchFridgeCleaning,
    watchMicrowaveCleaning,
    watchStairsCarpetCleaning
  ]);
  
  const calculateQuote = () => {
    if (isLoading || !watchServiceType || !watchPropertySize || !watchSoilingLevel) {
      return;
    }
    
    // Find matching pricing data
    const matchingData = pricingData.find(item => 
      item['Service Type'] === watchServiceType && 
      item['Property Size'] === watchPropertySize
    );
    
    if (!matchingData) {
      setQuoteDetails(null);
      return;
    }
    
    // Calculate base costs
    let labourCost = matchingData['Labour Cost (£)'];
    const materialCost = matchingData['Material Cost (£)'];
    const estimatedTime = matchingData['Estimated Time (hrs)'];
    const cleanersRequired = matchingData['Cleaners Required'];
    
    // Adjust for soiling level
    if (watchSoilingLevel === 'Medium') {
      labourCost *= 1.15; // 15% increase for medium soiling
    } else if (watchSoilingLevel === 'Heavy') {
      labourCost *= 1.3; // 30% increase for heavy soiling
    }
    
    // Calculate extras cost
    let extrasCost = 0;
    const extrasBreakdown = [];
    
    if (watchOvenCleaning) {
      extrasCost += 20;
      extrasBreakdown.push({ name: 'Oven Cleaning', cost: 20 });
    }
    
    if (watchFridgeCleaning) {
      extrasCost += 10;
      extrasBreakdown.push({ name: 'Fridge Cleaning', cost: 10 });
    }
    
    if (watchMicrowaveCleaning) {
      extrasCost += 5;
      extrasBreakdown.push({ name: 'Microwave Cleaning', cost: 5 });
    }
    
    if (watchCarpetCleaning && watchCarpetRooms > 0) {
      const carpetCost = 15 * watchCarpetRooms;
      extrasCost += carpetCost;
      extrasBreakdown.push({ name: `Carpet Cleaning (${watchCarpetRooms} rooms)`, cost: carpetCost });
    }
    
    if (watchStairsCarpetCleaning) {
      extrasCost += 10;
      extrasBreakdown.push({ name: 'Stairs Carpet Cleaning', cost: 10 });
    }
    
    if (watchWindowCleaning && watchWindowCount > 0) {
      const windowCost = 3 * watchWindowCount;
      extrasCost += windowCost;
      extrasBreakdown.push({ name: `Window Cleaning (${watchWindowCount} windows)`, cost: windowCost });
    }
    
    if (watchMouldCleaning && watchMouldRooms > 0) {
      // Assuming £25 per room for mould cleaning
      const mouldCost = 25 * watchMouldRooms;
      extrasCost += mouldCost;
      extrasBreakdown.push({ name: `Mould Cleaning (${watchMouldRooms} rooms)`, cost: mouldCost });
    }
    
    // Calculate final prices
    const baseCost = labourCost + materialCost;
    const contractorPrice = baseCost + extrasCost;
    const markup = contractorPrice * 0.3; // 30% markup
    const finalPrice = contractorPrice + markup;
    
    setQuoteDetails({
      serviceType: watchServiceType,
      propertySize: watchPropertySize,
      soilingLevel: watchSoilingLevel,
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
    });
  };
  
  const onSubmit = async (data: FormData) => {
    // Show quote details
    setShowQuote(true);
    
    // In a real implementation, this would send the data to the server
    // for email processing
    try {
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: data,
          quoteDetails
        }),
      });
      
      if (response.ok) {
        alert('Quote submitted successfully!');
      } else {
        alert('Failed to submit quote. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('An error occurred. Please try again later.');
    }
  };
  
  if (isLoading) {
    return <div className="text-center p-8">Loading pricing data...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-center mb-6">KMI Services Cleaning Quote</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Customer Details Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name*
              </label>
              <input
                type="text"
                {...register('customerName', { required: 'Customer name is required' })}
                className="w-full p-2 border rounded-md"
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address*
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full p-2 border rounded-md"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number*
              </label>
              <input
                type="tel"
                {...register('phone', { required: 'Phone number is required' })}
                className="w-full p-2 border rounded-md"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address*
              </label>
              <textarea
                {...register('address', { required: 'Address is required' })}
                className="w-full p-2 border rounded-md"
                rows={3}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Date*
              </label>
              <input
                type="date"
                {...register('preferredDate', { required: 'Date is required' })}
                className="w-full p-2 border rounded-md"
              />
              {errors.preferredDate && (
                <p className="text-red-500 text-sm mt-1">{errors.preferredDate.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time*
              </label>
              <input
                type="time"
                {...register('preferredTime', { required: 'Time is required' })}
                className="w-full p-2 border rounded-md"
              />
              {errors.preferredTime && (
                <p className="text-red-500 text-sm mt-1">{errors.preferredTime.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How did you hear about us?*
              </label>
              <select
                {...register('referralSource', { required: 'Please select an option' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select an option</option>
                <option value="Google">Google</option>
                <option value="Facebook">Facebook</option>
                <option value="Friend/Family">Friend/Family Referral</option>
                <option value="Previous Customer">Previous Customer</option>
                <option value="Other">Other</option>
              </select>
              {errors.referralSource && (
                <p className="text-red-500 text-sm mt-1">{errors.referralSource.message}</p>
              )}
            </div>
            
            {watchReferralSource === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Please specify
                </label>
                <input
                  type="text"
                  {...register('otherReferral', { 
                    required: watchReferralSource === 'Other' ? 'Please specify' : false 
                  })}
                  className="w-full p-2 border rounded-md"
                />
                {errors.otherReferral && (
                  <p className="text-red-500 text-sm mt-1">{errors.otherReferral.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Service Requirements Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Service Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type*
              </label>
              <select
                {...register('serviceType', { required: 'Service type is required' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="Regular Domestic Cleaning">Regular Domestic Cleaning</option>
                <option value="Deep Cleaning">Deep Cleaning</option>
                <option value="End-of-Tenancy Cleaning">End-of-Tenancy Cleaning</option>
                <option value="Specialised Cleaning">Specialised Cleaning</option>
              </select>
              {errors.serviceType && (
                <p className="text-red-500 text-sm mt-1">{errors.serviceType.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Size*
              </label>
              <select
                {...register('propertySize', { required: 'Property size is required' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select property size</option>
                <option value="1-bed (flat)">1-bed (flat)</option>
                <option value="2-bed (flat)">2-bed (flat)</option>
                <option value="3-bed (flat)">3-bed (flat)</option>
                <option value="1-bed (flat) +1 Bathroom">1-bed (flat) +1 Bathroom</option>
                <option value="2-bed (flat) +1 Bathroom">2-bed (flat) +1 Bathroom</option>
                <option value="3-bed (flat) +1 Bathroom">3-bed (flat) +1 Bathroom</option>
                <option value="2-bed (house w/ stairs)">2-bed (house w/ stairs)</option>
                <option value="3-bed (house w/ stairs)">3-bed (house w/ stairs)</option>
                <option value="4-bed (house w/ stairs)">4-bed (house w/ stairs)</option>
                <option value="5-bed (house w/ stairs)">5-bed (house w/ stairs)</option>
                <option value="2-bed (house w/ stairs) +1 Bathroom">2-bed (house w/ stairs) +1 Bathroom</option>
                <option value="3-bed (house w/ stairs) +1 Bathroom">3-bed (house w/ stairs) +1 Bathroom</option>
                <option value="4-bed (house w/ stairs) +1 Bathroom">4-bed (house w/ stairs) +1 Bathroom</option>
                <option value="5-bed (house w/ stairs) +1 Bathroom">5-bed (house w/ stairs) +1 Bathroom</option>
              </select>
              {errors.propertySize && (
                <p className="text-red-500 text-sm mt-1">{errors.propertySize.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soiling Level*
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="soiling-light"
                    value="Light"
                    {...register('soilingLevel', { required: 'Soiling level is required' })}
                    className="mr-2"
                  />
                  <label htmlFor="soiling-light">Light</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="soiling-medium"
                    value="Medium"
                    {...register('soilingLevel', { required: 'Soiling level is required' })}
                    className="mr-2"
                  />
                  <label htmlFor="soiling-medium">Medium</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="soiling-heavy"
                    value="Heavy"
                    {...register('soilingLevel', { required: 'Soiling level is required' })}
                    className="mr-2"
                  />
                  <label htmlFor="soiling-heavy">Heavy</label>
                </div>
              </div>
              {errors.soilingLevel && (
                <p className="text-red-500 text-sm mt-1">{errors.soilingLevel.message}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Optional Extras Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Optional Extras</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="oven-cleaning"
                  {...register('ovenCleaning')}
                  className="mr-2"
                />
                <label htmlFor="oven-cleaning">Oven Cleaning (£20)</label>
              </div>
              
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="fridge-cleaning"
                  {...register('fridgeCleaning')}
                  className="mr-2"
                />
                <label htmlFor="fridge-cleaning">Fridge Cleaning (£10)</label>
              </div>
              
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="microwave-cleaning"
                  {...register('microwaveCleaning')}
                  className="mr-2"
                />
                <label htmlFor="microwave-cleaning">Microwave Cleaning (£5)</label>
              </div>
              
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="stairs-carpet-cleaning"
                  {...register('stairsCarpetCleaning')}
                  className="mr-2"
                />
                <label htmlFor="stairs-carpet-cleaning">Stairs Carpet Cleaning (£10)</label>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="carpet-cleaning"
                    {...register('carpetCleaning')}
                    className="mr-2"
                  />
                  <label htmlFor="carpet-cleaning">Carpet Cleaning (£15/room)</label>
                </div>
                
                {watchCarpetCleaning && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of rooms:
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('carpetRooms', { 
                        valueAsNumber: true,
                        min: { value: 1, message: 'Must be at least 1' },
                        required: watchCarpetCleaning ? 'Required' : false
                      })}
                      className="w-20 p-2 border rounded-md"
                    />
                    {errors.carpetRooms && (
                      <p className="text-red-500 text-sm mt-1">{errors.carpetRooms.message}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="window-cleaning"
                    {...register('windowCleaning')}
                    className="mr-2"
                  />
                  <label htmlFor="window-cleaning">Window Cleaning (£3/window)</label>
                </div>
                
                {watchWindowCleaning && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of windows:
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('windowCount', { 
                        valueAsNumber: true,
                        min: { value: 1, message: 'Must be at least 1' },
                        required: watchWindowCleaning ? 'Required' : false
                      })}
                      className="w-20 p-2 border rounded-md"
                    />
                    {errors.windowCount && (
                      <p className="text-red-500 text-sm mt-1">{errors.windowCount.message}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="mould-cleaning"
                    {...register('mouldCleaning')}
                    className="mr-2"
                  />
                  <label htmlFor="mould-cleaning">Mould Cleaning (£25/room)</label>
                </div>
                
                {watchMouldCleaning && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of rooms:
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('mouldRooms', { 
                        valueAsNumber: true,
                        min: { value: 1, message: 'Must be at least 1' },
                        required: watchMouldCleaning ? 'Required' : false
                      })}
                      className="w-20 p-2 border rounded-md"
                    />
                    {errors.mouldRooms && (
                      <p className="text-red-500 text-sm mt-1">{errors.mouldRooms.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Quote Calculation Section */}
        {quoteDetails && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Quote Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Service Summary</h3>
                <p><strong>Service Type:</strong> {quoteDetails.serviceType}</p>
                <p><strong>Property Size:</strong> {quoteDetails.propertySize}</p>
                <p><strong>Soiling Level:</strong> {quoteDetails.soilingLevel}</p>
                <p><strong>Estimated Time:</strong> {quoteDetails.estimatedTime} hours</p>
                <p><strong>Cleaners Required:</strong> {quoteDetails.cleanersRequired}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Cost Breakdown</h3>
                <p><strong>Labour Cost:</strong> £{quoteDetails.labourCost}</p>
                <p><strong>Material Cost:</strong> £{quoteDetails.materialCost}</p>
                <p><strong>Base Cost:</strong> £{quoteDetails.baseCost}</p>
                
                {quoteDetails.extrasBreakdown.length > 0 && (
                  <>
                    <h4 className="font-medium mt-2">Selected Extras:</h4>
                    <ul className="list-disc pl-5">
                      {quoteDetails.extrasBreakdown.map((extra: any, index: number) => (
                        <li key={index}>{extra.name}: £{extra.cost.toFixed(2)}</li>
                      ))}
                    </ul>
                    <p><strong>Extras Total:</strong> £{quoteDetails.extrasCost}</p>
                  </>
                )}
                
                <p><strong>Contractor Price:</strong> £{quoteDetails.contractorPrice}</p>
                <p><strong>30% Markup:</strong> £{quoteDetails.markup}</p>
                <p className="text-lg font-bold mt-2">
                  <strong>Final Price:</strong> £{quoteDetails.finalPrice}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Additional Information Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                {...register('additionalNotes')}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Any specific requirements or information..."
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="site-visit"
                {...register('siteVisitRequired')}
                className="mr-2"
              />
              <label htmlFor="site-visit">Site visit required</label>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Please note:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>The customer will be asked to send photos or book a site visit.</li>
                <li>A final cost quote will be created after assessment.</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Quote
          </button>
        </div>
      </form>
      
      {/* Quote Modal */}
      {showQuote && quoteDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Quote Generated</h2>
            <p className="mb-4">Your quote has been generated and sent to info@kmiservices.co.uk.</p>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="text-xl font-semibold mb-2">Quote Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Service Type:</strong> {quoteDetails.serviceType}</p>
                  <p><strong>Property Size:</strong> {quoteDetails.propertySize}</p>
                  <p><strong>Soiling Level:</strong> {quoteDetails.soilingLevel}</p>
                  <p><strong>Estimated Time:</strong> {quoteDetails.estimatedTime} hours</p>
                  <p><strong>Cleaners Required:</strong> {quoteDetails.cleanersRequired}</p>
                </div>
                
                <div>
                  <p className="text-lg font-bold">
                    <strong>Final Price:</strong> £{quoteDetails.finalPrice}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-4">
                {watchSiteVisitRequired 
                  ? 'A site visit will be arranged to finalize the quote.' 
                  : 'Please send photos to help us finalize the quote.'}
              </p>
              <button
                onClick={() => setShowQuote(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
