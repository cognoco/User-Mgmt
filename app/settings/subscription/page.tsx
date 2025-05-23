'use client';
import '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { SubscriptionManager } from '@/ui/styled/subscription/SubscriptionManager';
import { PlanSelector } from '@/ui/styled/subscription/PlanSelector';
import { BillingForm } from '@/ui/styled/subscription/BillingForm';
import { InvoiceList } from '@/ui/styled/subscription/InvoiceList';

export default function SubscriptionSettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-center md:text-left">
        {t('subscription.title', 'Subscription Management')}
      </h1>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('subscription.current', 'Current Subscription')}
        </h2>
        <SubscriptionManager />
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('subscription.availablePlans', 'Available Plans')}
        </h2>
        <PlanSelector />
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('subscription.billingInfo', 'Billing Information')}
        </h2>
        <BillingForm />
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('subscription.invoiceHistory', 'Invoice History')}
        </h2>
        <InvoiceList />
      </div>
    </div>
  );
}
