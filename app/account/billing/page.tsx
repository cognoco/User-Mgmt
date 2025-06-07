'use client';
import { SubscriptionManager } from '@/ui/styled/subscription/SubscriptionManager';
import { PlanSelector } from '@/ui/styled/subscription/PlanSelector';
import { BillingForm } from '@/ui/styled/subscription/BillingForm';
import { InvoiceList } from '@/ui/styled/subscription/InvoiceList';

export default function BillingPage() {
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Subscription Management</h1>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
        <SubscriptionManager />
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <PlanSelector />
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Billing Information</h2>
        <BillingForm />
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Invoice History</h2>
        <InvoiceList />
      </div>
    </div>
  );
}
