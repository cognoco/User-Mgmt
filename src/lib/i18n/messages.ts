import i18n from './index';
import { USER_MANAGEMENT_NAMESPACE, type LanguageCode } from './index';

/**
 * Retrieve a raw translation template for the given key and locale.
 */
export function getMessageTemplate(
  key: string,
  locale: LanguageCode,
  namespace: string = USER_MANAGEMENT_NAMESPACE
): string | undefined {
  return i18n.getResource(locale, namespace, key) as string | undefined;
}

/**
 * Format a message using i18next with optional variables.
 */
export function formatMessage(
  key: string,
  variables: Record<string, string> = {},
  locale: LanguageCode = i18n.language as LanguageCode,
  namespace: string = USER_MANAGEMENT_NAMESPACE
): string {
  return i18n.t(key, { lng: locale, ns: namespace, ...variables, defaultValue: key });
}

/**
 * Format an error message based on an error code.
 */
export function formatErrorMessage(
  code: string,
  variables: Record<string, string> = {},
  locale: LanguageCode = i18n.language as LanguageCode,
  namespace: string = USER_MANAGEMENT_NAMESPACE
): string {
  return formatMessage(`errors.${code}`, variables, locale, namespace);
}

/**
 * List of languages that use right-to-left direction.
 */
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'] as const;

export function isRtlLanguage(code: string): boolean {
  const lang = code.split('-')[0];
  return RTL_LANGUAGES.includes(lang as (typeof RTL_LANGUAGES)[number]);
}
