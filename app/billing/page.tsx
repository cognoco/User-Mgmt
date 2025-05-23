'use client';
import { useSubscription } from '@/hooks/subscription/use-subscription';
import { useBilling } from '@/hooks/subscription/use-billing';
import { SubscriptionManager } from '@/ui/styled/subscription/SubscriptionManager';
import { PlanSelector } from '@/ui/styled/subscription/PlanSelector';
import { BillingForm } from '@/ui/styled/subscription/BillingForm';
import { InvoiceList } from '@/ui/styled/subscription/InvoiceList';

export default function BillingPage() {
  const {
    subscription,
    plans,
    loading: subLoading,
    error: subError,
    changePlan,
    cancelSubscription
  } = useSubscription();

  const {
    billingInfo,
    invoices,
    loading: billLoading,
    error: billError,
    updateBillingInfo
  } = useBilling();

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Subscription Management</h1>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
        <SubscriptionManager 
          subscription={subscription}
          loading={subLoading}
          error={subError}
          onCancel={cancelSubscription}
        />
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <PlanSelector 
          plans={plans}
          currentPlanId={subscription?.planId}
          loading={subLoading}
          error={subError}
          onSelect={changePlan}
        />
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Billing Information</h2>
        <BillingForm 
          billingInfo={billingInfo}
          loading={billLoading}
          error={billError}
          onUpdate={updateBillingInfo}
        />
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Invoice History</h2>
        <InvoiceList 
          invoices={invoices}
          loading={billLoading}
          error={billError}
        />
      </div>
    </div>
  );
}
