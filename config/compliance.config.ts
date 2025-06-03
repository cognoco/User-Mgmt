export interface ComplianceConfig {
  piiFields: string[];
  auditLogRetentionDays: number;
}

const config: ComplianceConfig = {
  piiFields: (process.env.PII_FIELDS || 'password,token,secret,apiKey,credit_card,ssn').split(',').map(s => s.trim()).filter(Boolean),
  auditLogRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '90', 10)
};

export default config;
