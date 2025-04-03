'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

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

type FormData = {
  serviceType: string;
  propertySize: string;
  extraName: string;
  extraCost: number;
  markupPercentage: number;
}

export default function DataManagement() {
  const [pricingData, setPricingData] = useState<PricingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [propertySizes, setPropertySizes] = useState<string[]>([]);
  const [extras, setExtras] = useState<{name: string, cost: number}[]>([]);
  const [markupPercentage, setMarkupPercentage] = useState(30);
  const [editMode, setEditMode] = useState<'service' | 'property' | 'extra' | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>();
  
  useEffect(() => {
    fetchPricingData();
  }, []);
  
  const fetchPricingData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/pricing_data.json');
      if (response.ok) {
        const data = await response.json();
        setPricingData(data);
        
        // Extract unique service types
        const uniqueServiceTypes = Array.from(new Set(data.map((item: PricingData) => item['Service Type'])))
          .filter(Boolean) as string[];
        setServiceTypes(uniqueServiceTypes);
        
        // Extract unique property sizes
        const uniquePropertySizes = Array.from(new Set(data.map((item: PricingData) => item['Property Size'])))
          .filter(Boolean) as string[];
        setPropertySizes(uniquePropertySizes);
        
        // Extract extras
        const extrasData: {name: string, cost: number}[] = [];
        data.forEach((item: PricingData) => {
          if (item['Optional Extra'] && item['Extra Cost (£)']) {
            const extraName = item['Optional Extra'];
            const extraCost = item['Extra Cost (£)'];
            
            if (!extrasData.some(e => e.name === extraName)) {
              extrasData.push({ name: extraName, cost: extraCost });
            }
          }
        });
        setExtras(extrasData);
      } else {
        setMessage({ type: 'error', text: 'Failed to load pricing data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading pricing data' });
      console.error('Error loading pricing data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdatePricing = async (data: FormData) => {
    try {
      // In a real implementation, this would send the data to the server
      // to update the pricing data file
      
      setMessage({ type: 'success', text: 'Pricing data updated successfully!' });
      
      // Simulate successful update
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update pricing data' });
      console.error('Error updating pricing data:', error);
    }
  };
  
  const startEdit = (mode: 'service' | 'property' | 'extra', item: any) => {
    setEditMode(mode);
    setEditItem(item);
    
    if (mode === 'extra') {
      setValue('extraName', item.name);
      setValue('extraCost', item.cost);
    }
  };
  
  const cancelEdit = () => {
    setEditMode(null);
    setEditItem(null);
    reset();
  };
  
  const handleAddService = () => {
    // Logic to add a new service type
    const newServiceName = prompt('Enter new service type name:');
    if (newServiceName && !serviceTypes.includes(newServiceName)) {
      setServiceTypes([...serviceTypes, newServiceName]);
      setMessage({ type: 'success', text: `Added new service type: ${newServiceName}` });
    }
  };
  
  const handleAddPropertySize = () => {
    // Logic to add a new property size
    const newPropertySize = prompt('Enter new property size:');
    if (newPropertySize && !propertySizes.includes(newPropertySize)) {
      setPropertySizes([...propertySizes, newPropertySize]);
      setMessage({ type: 'success', text: `Added new property size: ${newPropertySize}` });
    }
  };
  
  const handleAddExtra = () => {
    // Logic to add a new extra
    setEditMode('extra');
    setEditItem(null);
    setValue('extraName', '');
    setValue('extraCost', 0);
  };
  
  const handleSaveExtra = (data: FormData) => {
    if (editItem) {
      // Update existing extra
      const updatedExtras = extras.map(extra => 
        extra.name === editItem.name ? { name: data.extraName, cost: data.extraCost } : extra
      );
      setExtras(updatedExtras);
      setMessage({ type: 'success', text: `Updated extra: ${data.extraName}` });
    } else {
      // Add new extra
      if (extras.some(e => e.name === data.extraName)) {
        setMessage({ type: 'error', text: 'An extra with this name already exists' });
        return;
      }
      setExtras([...extras, { name: data.extraName, cost: data.extraCost }]);
      setMessage({ type: 'success', text: `Added new extra: ${data.extraName}` });
    }
    
    cancelEdit();
  };
  
  const handleDeleteExtra = (extraName: string) => {
    if (confirm(`Are you sure you want to delete the extra: ${extraName}?`)) {
      const updatedExtras = extras.filter(extra => extra.name !== extraName);
      setExtras(updatedExtras);
      setMessage({ type: 'success', text: `Deleted extra: ${extraName}` });
    }
  };
  
  const handleUpdateMarkup = () => {
    const newMarkup = prompt('Enter new markup percentage:', markupPercentage.toString());
    if (newMarkup) {
      const markupValue = parseFloat(newMarkup);
      if (!isNaN(markupValue) && markupValue >= 0) {
        setMarkupPercentage(markupValue);
        setMessage({ type: 'success', text: `Updated markup to ${markupValue}%` });
      } else {
        setMessage({ type: 'error', text: 'Please enter a valid number for markup percentage' });
      }
    }
  };
  
  const handleSaveAll = async () => {
    try {
      // In a real implementation, this would send all the updated data to the server
      
      setMessage({ type: 'success', text: 'All pricing data saved successfully!' });
      
      // Simulate successful update
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save pricing data' });
      console.error('Error saving pricing data:', error);
    }
  };
  
  if (isLoading) {
    return <div className="text-center p-8">Loading pricing data...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-center mb-6">Pricing Data Management</h1>
      
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Service Types</h2>
          <button
            onClick={handleAddService}
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add Service Type
          </button>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {serviceTypes.map((service, index) => (
              <li key={index} className="flex justify-between items-center p-2 border-b">
                <span>{service}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit('service', service)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Property Sizes</h2>
          <button
            onClick={handleAddPropertySize}
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add Property Size
          </button>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {propertySizes.map((size, index) => (
              <li key={index} className="flex justify-between items-center p-2 border-b">
                <span>{size}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit('property', size)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Optional Extras</h2>
          <button
            onClick={handleAddExtra}
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Add Extra
          </button>
        </div>
        
        {editMode === 'extra' && (
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <h3 className="font-medium mb-3">{editItem ? 'Edit Extra' : 'Add New Extra'}</h3>
            <form onSubmit={handleSubmit(handleSaveExtra)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extra Name
                </label>
                <input
                  type="text"
                  {...register('extraName', { required: 'Name is required' })}
                  className="w-full p-2 border rounded-md"
                />
                {errors.extraName && (
                  <p className="text-red-500 text-sm mt-1">{errors.extraName.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('extraCost', { 
                    required: 'Cost is required',
                    min: { value: 0, message: 'Cost must be positive' },
                    valueAsNumber: true
                  })}
                  className="w-full p-2 border rounded-md"
                />
                {errors.extraCost && (
                  <p className="text-red-500 text-sm mt-1">{errors.extraCost.message}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="bg-gray-50 p-4 rounded-md">
          <ul className="divide-y">
            {extras.map((extra, index) => (
              <li key={index} className="flex justify-between items-center py-3">
                <div>
                  <span className="font-medium">{extra.name}</span>
                  <span className="ml-2 text-gray-600">£{extra.cost.toFixed(2)}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit('extra', extra)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExtra(extra.name)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Markup Percentage</h2>
          <button
            onClick={handleUpdateMarkup}
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Update Markup
          </button>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-lg font-medium">Current Markup: {markupPercentage}%</p>
          <p className="text-sm text-gray-600 mt-1">
            This is the percentage added to the contractor price to calculate the final customer price.
          </p>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={handleSaveAll}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
}
