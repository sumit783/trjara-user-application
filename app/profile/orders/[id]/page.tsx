import React from 'react';
import { OrderDetailsClient } from './order-details-client';

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

interface OrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params;
  return <OrderDetailsClient orderId={id} />;
}
