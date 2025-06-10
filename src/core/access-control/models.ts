export type AttributeConditionOperator = 'eq' | 'neq' | 'in' | 'gt' | 'lt';

export interface AttributeCondition {
  field: string;
  operator: AttributeConditionOperator;
  value: string | number | boolean | Array<string | number | boolean>;
}

export interface AccessRule {
  id: string;
  action: string; // permission or role action
  description?: string;
  user?: AttributeCondition[];
  resource?: AttributeCondition[];
  environment?: AttributeCondition[];
}

export interface AccessAuditEntry {
  ruleId: string | null;
  action: string;
  allowed: boolean;
  reason: string;
  timestamp: number;
}
