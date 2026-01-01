import React, { useState } from 'react';
import { Check, Package, Truck, Home, CheckCircle, XCircle, Clock } from 'lucide-react';

const OrderStatusDemo = () => {
  const [selectedPill, setSelectedPill] = useState('Processing');
  const [selectedStepper, setSelectedStepper] = useState('Processing');

  const statuses = [
    { id: 'Pending', label: 'Pending', icon: Clock },
    { id: 'Processing', label: 'Processing', icon: Package },
    { id: 'Out For Delivery', label: 'Out For Delivery', icon: Truck },
    { id: 'Ready For Pick Up', label: 'Ready For Pick Up', icon: Home },
    { id: 'Completed', label: 'Completed', icon: CheckCircle },
    { id: 'Cancelled', label: 'Cancelled', icon: XCircle }
  ];

  const stepperStatuses = [
    { id: 'Pending', label: 'Pending', description: 'Order received' },
    { id: 'Processing', label: 'Processing', description: 'Being prepared' },
    { id: 'Out For Delivery', label: 'Out For Delivery', description: 'On the way' },
    { id: 'Completed', label: 'Completed', description: 'Delivered' }
  ];

  const getStepperIndex = (status) => {
    return stepperStatuses.findIndex(s => s.id === status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Status UI Alternatives</h1>
          <p className="text-gray-600">Modern approaches for e-commerce status selection</p>
        </div>

        {/* Option 2: Segmented Control / Pill Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Option 2: Pill Buttons</h2>
            <p className="text-sm text-gray-600">Horizontal scrollable pills with icons</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-3">Order #JFS-19f13a89-1767165918529</p>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {statuses.map((status) => {
                const Icon = status.icon;
                const isSelected = selectedPill === status.id;
                return (
                  <button
                    key={status.id}
                    onClick={() => setSelectedPill(status.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 ${
                      isSelected
                        ? 'bg-pink-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{status.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition">
              Cancel
            </button>
            <button className="flex-1 py-3 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition shadow-lg">
              Confirm
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">✨ Benefits:</span> Modern look, saves space, clear visual feedback, easy to scan
            </p>
          </div>
        </div>

        {/* Option 5: Status Stepper / Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Option 5: Status Timeline</h2>
            <p className="text-sm text-gray-600">Visual progression with clickable stages</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-4">
            <p className="text-xs text-gray-500 mb-6">Order #JFS-19f13a89-1767165918529</p>
            
            <div className="relative">
              {stepperStatuses.map((status, index) => {
                const isSelected = selectedStepper === status.id;
                const isPast = getStepperIndex(selectedStepper) > index;
                const isLast = index === stepperStatuses.length - 1;

                return (
                  <div key={status.id} className="relative">
                    <button
                      onClick={() => setSelectedStepper(status.id)}
                      className="w-full flex items-start gap-4 pb-8 group"
                    >
                      {/* Circle */}
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isSelected
                              ? 'bg-pink-500 text-white ring-4 ring-pink-200 scale-110'
                              : isPast
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-400 group-hover:bg-gray-300'
                          }`}
                        >
                          {isPast ? <Check size={20} /> : index + 1}
                        </div>
                        
                        {/* Connecting Line */}
                        {!isLast && (
                          <div
                            className={`absolute left-5 top-10 w-0.5 h-14 -ml-px transition-colors ${
                              isPast || isSelected ? 'bg-pink-300' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left pt-1">
                        <h3
                          className={`font-semibold mb-1 transition-colors ${
                            isSelected
                              ? 'text-pink-600'
                              : isPast
                              ? 'text-green-600'
                              : 'text-gray-700 group-hover:text-gray-900'
                          }`}
                        >
                          {status.label}
                        </h3>
                        <p
                          className={`text-sm ${
                            isSelected ? 'text-pink-500' : 'text-gray-500'
                          }`}
                        >
                          {status.description}
                        </p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Special Status Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => setSelectedStepper('Cancelled')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedStepper === 'Cancelled'
                    ? 'bg-red-500 text-white'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                <XCircle size={16} className="inline mr-2" />
                Cancel Order
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition">
              Cancel
            </button>
            <button className="flex-1 py-3 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition shadow-lg">
              Confirm
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">✨ Benefits:</span> Shows order flow visually, intuitive progression, clear status relationship
            </p>
          </div>
        </div>

        {/* Comparison */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Which Should You Choose?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">🎯 Choose Pill Buttons if:</p>
              <ul className="space-y-1 opacity-90">
                <li>• You want a modern, compact design</li>
                <li>• All statuses are equally important</li>
                <li>• You need horizontal scrolling on mobile</li>
                <li>• Speed of selection is priority</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">📊 Choose Timeline if:</p>
              <ul className="space-y-1 opacity-90">
                <li>• You want to show order progression</li>
                <li>• Statuses follow a logical sequence</li>
                <li>• Users need context for each stage</li>
                <li>• Better UX for understanding flow</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderStatusDemo;