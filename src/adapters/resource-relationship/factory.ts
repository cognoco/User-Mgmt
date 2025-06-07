import type { IResourceRelationshipDataProvider } from '@/core/resourceRelationship/IResourceRelationshipDataProvider'0;
import { SupabaseResourceRelationshipProvider } from '@/src/adapters/resource-relationship/supabase/supabaseResourceRelationship.provider'122;

export function createSupabaseResourceRelationshipProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): IResourceRelationshipDataProvider {
  return new SupabaseResourceRelationshipProvider(options.supabaseUrl, options.supabaseKey);
}

export function createResourceRelationshipProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): IResourceRelationshipDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseResourceRelationshipProvider(config.options);
    default:
      throw new Error(`Unsupported resource relationship provider type: ${config.type}`);
  }
}

export default createSupabaseResourceRelationshipProvider;
