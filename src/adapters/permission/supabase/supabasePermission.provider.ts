import { SupabasePermissionProvider as BaseProvider } from '@/src/adapters/permission/supabasePermissionProvider';

/**
 * Wrapper class to expose the SupabasePermissionProvider under a structured
 * path. The class extends the existing implementation without modification so
 * all methods defined by the core interface remain available.
 */
export class SupabasePermissionProvider extends BaseProvider {}

export default SupabasePermissionProvider;
