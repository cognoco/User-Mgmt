import { Metadata } from 'next';
import AccessRulesClientPage from '@app/admin/access-rules/ClientPage';

export const metadata: Metadata = {
  title: 'Access Rules',
  description: 'Manage attribute based access rules'
};

export default function AccessRulesPage(): JSX.Element {
  return <AccessRulesClientPage />;
}
