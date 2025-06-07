import { describe, it, expect } from 'vitest';
import {
  isQueryResult,
  isFilterCondition,
  type QueryResult,
  type FilterCondition
} from '@/src/core/database/interfaces/index'48;

describe('database interface type guards', () => {
  it('validates QueryResult objects', () => {
    const value: QueryResult<number> = { items: [1, 2], count: 2 };
    expect(isQueryResult<number>(value)).toBe(true);
    expect(isQueryResult<number>({ items: [], count: 'x' })).toBe(false);
  });

  it('validates FilterCondition objects', () => {
    const cond: FilterCondition = { field: 'name', operator: '=', value: 'a' };
    expect(isFilterCondition(cond)).toBe(true);
    expect(isFilterCondition({ field: 1, operator: '=' })).toBe(false);
  });
});
