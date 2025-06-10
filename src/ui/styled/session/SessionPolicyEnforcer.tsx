/**
 * Styled Session Policy Enforcer
 *
 * Extends the headless SessionPolicyEnforcer with styling.
 * Since this component doesn't render visible UI, it simply re-exports the headless version.
 */
import { SessionPolicyEnforcer as HeadlessSessionPolicyEnforcer, SessionPolicyEnforcerProps } from '@/ui/headless/session/SessionPolicyEnforcer';

/**
 * Since this component doesn't have any visual styling needs, we simply re-export the headless version.
 * This follows the architecture pattern while acknowledging that some components don't need visual styling.
 */
export const SessionPolicyEnforcer = HeadlessSessionPolicyEnforcer;

// Re-export the props interface for convenience
export type { SessionPolicyEnforcerProps };
