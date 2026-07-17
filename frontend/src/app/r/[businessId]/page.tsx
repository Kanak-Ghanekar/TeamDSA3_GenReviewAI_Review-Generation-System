'use client';

import React, { useState, useEffect } from 'react';
import CustomerFlow from '@/components/customer/CustomerFlow';

interface RouteParams {
  params: {
    businessId: string;
  };
}

export default function CustomerReviewPage({ params }: RouteParams) {
  const { businessId } = params;

  const [businessData, setBusinessData] = useState<{
    name: string;
    category: string;
    googlePlaceId: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId === 'test-restaurant') {
      setBusinessData({
        name: 'Spice Garden Bistro',
        category: 'restaurant',
        googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83VSY4'
      });
      setLoading(false);
      return;
    }

    // Fetch real business details from Postgres database
    fetch(`/api/businesses?id=${encodeURIComponent(businessId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.business) {
          setBusinessData({
            name: data.business.name,
            category: data.business.category,
            googlePlaceId: data.business.googlePlaceId
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load business:', err);
        setLoading(false);
      });
  }, [businessId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-sm font-semibold text-gray-400">
        Loading review page...
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-sm font-semibold text-red-500">
        Business profile not found.
      </div>
    );
  }

  return (
    <CustomerFlow
      businessId={businessId}
      businessName={businessData.name}
      category={businessData.category}
      googlePlaceId={businessData.googlePlaceId}
    />
  );
}
