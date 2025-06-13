import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST, DELETE } from '@app/api/organizations/[orgId]/sso/domains/route';
import { callRouteWithParams } from 'tests/utils/callRoute';

describe('Domain Verification API Routes', () => {
  const mockOrgId = 'test-org-123';
  
  beforeEach(() => {
    vi.resetModules();
  });

  describe('GET /domains', () => {
    it('returns empty domains list for new organization', async () => {
      const response = await callRouteWithParams(
        GET,
        { orgId: mockOrgId },
        `http://localhost/api/organizations/${mockOrgId}/sso/domains`
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        domains: [],
        verificationMethods: ['dns', 'file'],
      });
    });

    it('returns list of configured domains', async () => {
      // First add a domain
      await callRouteWithParams(
        POST,
        { orgId: mockOrgId },
        `http://localhost/api/organizations/${mockOrgId}/sso/domains`,
        { method: 'POST', body: { domain: 'example.com' } }
      );

      // Then get the list
      const response = await callRouteWithParams(
        GET,
        { orgId: mockOrgId },
        `http://localhost/api/organizations/${mockOrgId}/sso/domains`
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.domains).toHaveLength(1);
      expect(data.domains[0]).toEqual({
        domain: 'example.com',
        status: 'pending',
        verificationMethod: null,
        verificationDetails: null,
      });
    });
  });

  describe('POST /domains', () => {
    it('adds a new domain successfully', async () => {
      const response = await callRouteWithParams(
        POST,
        { orgId: mockOrgId },
        `http://localhost/api/organizations/${mockOrgId}/sso/domains`,
        { method: 'POST', body: { domain: 'test.com' } }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        domain: 'test.com',
        status: 'pending',
        verificationMethod: null,
        verificationDetails: null,
      });
    });

    it('validates domain format', async () => {
      const response = await callRouteWithParams(
        POST,
        { orgId: mockOrgId },
        `http://localhost/api/organizations/${mockOrgId}/sso/domains`,
        { method: 'POST', body: { domain: 'invalid-domain' } }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Invalid domain format');
    });

    it('prevents duplicate domains', async () => {
      // Add domain first time
      await callRouteWithParams(
        POST,
        { orgId: mockOrgId },
        `http://localhost/api/organizations/${mockOrgId}/sso/domains`,
        { method: 'POST', body: { domain: 'duplicate.com' } }
      );

      // Try to add same domain again
      const response = await callRouteWithParams(
        POST,
        { orgId: mockOrgId },
        `http://localhost/api/organizations/${mockOrgId}/sso/domains`,
        { method: 'POST', body: { domain: 'duplicate.com' } }
      );
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Domain already exists');
    });
  });

  describe('DELETE /domains', () => {
    it('removes a domain successfully', async () => {
      // First add a domain
      await callRouteWithParams(
        POST,
        { orgId: mockOrgId },
        `http://localhost/api/organizations/${mockOrgId}/sso/domains`,
        { method: 'POST', body: { domain: 'todelete.com' } }
      );

      // Then delete it
      const response = await callRouteWithParams(
        DELETE,
        { orgId: mockOrgId },
        `http://localhost/api/organizations/${mockOrgId}/sso/domains`,
        { method: 'DELETE', body: { domain: 'todelete.com' } }
      );
      expect(response.status).toBe(200);

      // Verify domain was removed
      const getResponse = await callRouteWithParams(
        GET,
        { orgId: mockOrgId },
        `http://localhost/api/organizations/${mockOrgId}/sso/domains`
      );
      const data = await getResponse.json();

      expect(data.domains).toHaveLength(0);
    });

    it('returns 404 for non-existent domain', async () => {
      const response = await callRouteWithParams(
        DELETE,
        { orgId: mockOrgId },
        `http://localhost/api/organizations/${mockOrgId}/sso/domains`,
        { method: 'DELETE', body: { domain: 'nonexistent.com' } }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error', 'Domain not found');
    });
  });
}); 