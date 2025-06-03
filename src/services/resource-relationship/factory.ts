import { AdapterRegistry } from '@/adapters/registry';
import { getServiceSupabase } from '@/lib/database/supabase';
import type { ResourceRelationshipService } from '@/core/resource-relationship/interfaces';
import type { IResourceRelationshipDataProvider } from '@/core/resource-relationship/IResourceRelationshipDataProvider';
import { DefaultResourceRelationshipService } from './default-resource-relationship.service';
import { SupabaseResourceRelationshipProvider } from '@/adapters/resource-relationship/supabase-provider';

export function createResourceRelationshipService(
  supabase = getServiceSupabase(),
): ResourceRelationshipService {
  let provider: IResourceRelationshipDataProvider | null = null;
  try {
    provider = AdapterRegistry.getInstance().getAdapter<IResourceRelationshipDataProvider>('resourceRelationship');
  } catch {
    provider = new SupabaseResourceRelationshipProvider(supabase);
    AdapterRegistry.getInstance().registerAdapter('resourceRelationship', provider);
  }
  return new DefaultResourceRelationshipService(provider);
}
