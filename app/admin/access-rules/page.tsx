import { Metadata } from 'next';
import React from 'react';
import AccessRulesClientPage from '@app/admin/access-rules/ClientPage';

export const metadata: Metadata = {
  title: 'Access Rules',
  description: 'Manage attribute based access rules'
};

export default function AccessRulesPage() {
  return <AccessRulesClientPage />;
}
