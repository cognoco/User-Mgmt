// __tests__/utils/integration-testing-utils.js

import type { ReactElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { supabase } from '@/lib/database/supabase';

interface IntegrationTestOptions {
  initialRoute?: string;
  authUser?: unknown;
  mockData?: Record<string, unknown>;
}

/**
 * Creates a testing environment for integration tests
 * @param {Object} options - Options for the test environment
 * @returns {Object} Test environment
 */
export function setupIntegrationTest(options: IntegrationTestOptions = {}) {
  const {
    initialRoute = '/',
    authUser = null,
    mockData = {}
  } = options;
  
  // Set up authentication mocks
  if (authUser) {
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
      data: { user: authUser },
      error: null
    });
  } else {
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
      data: { user: null },
      error: null
    });
  }
  
  // Set up data mocks
  setupDataMocks(mockData);
  
  // Initialize user event
  const user = userEvent.setup();
  
  return {
    user,
    /**
     * Renders a component for integration testing
     * @param {React.ReactElement} ui - Component to render
     * @param {Object} renderOptions - Additional render options
     * @returns {Object} Render result
     */
    renderComponent: (
      ui: ReactElement,
      renderOptions: Parameters<typeof render>[1] = {}
    ) => {
      const result = render(ui, renderOptions);
      return {
        ...result,
        user,
        // Helper to wait for all loading indicators to disappear
        waitForReady: () => waitFor(() => {
          const loadingElements = [
            ...screen.queryAllByRole('progressbar'),
            ...screen.queryAllByText(/loading/i),
            ...screen.queryAllByLabelText(/loading/i)
          ];
          if (loadingElements.length > 0) {
            throw new Error('Still loading');
          }
        })
      };
    },
    // Add function to simulate user actions in sequence
    simulateUserFlow: async (
      actions: Array<(user: ReturnType<typeof userEvent.setup>) => Promise<void>>
    ) => {
      for (const action of actions) {
        await action(user);
      }
    }
  };
}

/**
 * Sets up data mocks for database tables
 * @param {Object} mockData - Object with table names as keys and mock data as values
 */
function setupDataMocks(mockData: Record<string, unknown>) {
  for (const [table, data] of Object.entries(mockData)) {
    // Set up mock for this table
    vi.spyOn(supabase, 'from').mockImplementation((requestedTable: string) => {
      if (requestedTable === table) {
        return createTableMock(data);
      }
      // Default mock for other tables
      return createTableMock([]);
    });
  }
}

/**
 * Creates a mock for a database table
 * @param {Array|Object} data - Data to return for the table
 * @returns {Object} Mock table object
 */
function createTableMock(data: any[] | Record<string, unknown>) {
  // Handle both array and single object data
  const mockData = Array.isArray(data) ? data : [data];
  
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    update: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    upsert: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    delete: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ 
      data: Array.isArray(data) ? data[0] : data, 
      error: null 
    }),
    // Add filtering capability for integration tests
    filter: (field: string, operator: string, value: unknown) => {
      // Filter the data based on criteria
      const filteredData = mockData.filter(item => {
        if (operator === 'eq') return item[field] === value;
        if (operator === 'gt') return item[field] > value;
        if (operator === 'lt') return item[field] < value;
        if (operator === 'in') return value.includes(item[field]);
        return true;
      });
      
      return {
        ...createTableMock(filteredData),
        data: filteredData,
        then: (callback: (result: { data: unknown[]; error: null }) => unknown) =>
          Promise.resolve(callback({ data: filteredData, error: null }))
      };
    },
    // Allow chaining with promises for async/await
    then: (callback: (result: { data: unknown[]; error: null }) => unknown) =>
      Promise.resolve(callback({ data: mockData, error: null }))
  };
}

/**
 * Tests a complete user flow across multiple components
 * @param {Array} steps - Array of test step functions
 * @param {Object} options - Test options including initial setup
 * @returns {Promise<Object>} Test results
 */
export async function testUserFlow(
  steps: Array<(env: any) => Promise<Record<string, unknown> | void>>,
  options: IntegrationTestOptions = {}
) {
  const testEnv = setupIntegrationTest(options);
  const results = {};
  
  // Run each step in sequence
  for (const [index, step] of steps.entries()) {
    // Run the step
    const stepResult = await step({
      ...testEnv,
      results, // Pass accumulated results to next steps
      stepIndex: index
    });
    
    // Store results for next steps
    if (stepResult) {
      Object.assign(results, stepResult);
    }
  }
  
  return results;
}

/**
 * Creates a step for a user flow test
 * @param {string} name - Step name
 * @param {Function} action - Step function
 * @returns {Function} Configured step function
 */
export function createFlowStep(
  name: string,
  action: (env: any) => Promise<any>
) {
  const step = async (testEnv: any) => {
    console.log(`Running step: ${name}`);
    return action(testEnv);
  };
  
  step.displayName = name;
  return step;
}

/**
 * Simulates form submission in integration tests
 * @param {Object} options - Options for form submission
 * @returns {Function} Form submission step
 */
export function submitForm(options: {
  formTestId?: string;
  fields?: Record<string, string>;
  submitButtonText?: string;
  waitForResponse?: boolean;
}) {
  const {
    formTestId = 'form',
    fields = {},
    submitButtonText = 'Submit',
    waitForResponse = true
  } = options;
  
  return createFlowStep('Submit Form', async ({ user }) => {
    // Find the form
    const form = screen.getByTestId(formTestId);
    
    // Fill in fields
    for (const [fieldName, value] of Object.entries(fields)) {
      const field = screen.getByLabelText(fieldName) || screen.getByTestId(`field-${fieldName}`);
      await user.clear(field);
      await user.type(field, value);
    }
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: submitButtonText });
    await user.click(submitButton);
    
    // Wait for response if requested
    if (waitForResponse) {
      await waitFor(() => {
        const loading = screen.queryByText(/loading/i);
        if (loading) {
          throw new Error('Still loading');
        }
      });
    }
  });
}
