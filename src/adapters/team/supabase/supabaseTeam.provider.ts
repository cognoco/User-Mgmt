import { SupabaseTeamProvider as BaseProvider } from '@/adapters/team/supabaseTeamProvider';

/**
 * Wrapper class to expose the SupabaseTeamProvider under a structured path.
 * This class simply extends {@link BaseProvider} so existing functionality is
 * preserved while matching the expected file layout from the core interfaces.
 */
export class SupabaseTeamProvider extends BaseProvider {}

export default SupabaseTeamProvider;
