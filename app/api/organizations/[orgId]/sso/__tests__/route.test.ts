import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT } from '../route';

describe('SSO API Routes', () => {
  const mockOrgId = 'test-org-123';
  const mockParams = { params: { orgId: mockOrgId } };

  beforeEach(() => {
    // Reset any module state between tests
    vi.resetModules();
  });

  describe('GET /api/organizations/[orgId]/sso/settings', () => {
    it('returns default settings for new organization', async () => {
      const request = new NextRequest(
        new URL(`http://localhost/api/organizations/${mockOrgId}/sso/settings`)
      );

      const response = await GET(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        sso_enabled: false,
        idp_type: null,
      });
    });
  });

  describe('GET /api/organizations/[orgId]/sso/status', () => {
    it('returns default status for new organization', async () => {
      const request = new NextRequest(
        new URL(`http://localhost/api/organizations/${mockOrgId}/sso/status`)
      );

      const response = await GET(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        status: 'unknown',
        lastSuccessfulLogin: null,
        lastError: null,
        totalSuccessfulLogins24h: 0,
      });
    });
  });

  describe('GET /api/organizations/[orgId]/sso/metadata', () => {
    it('returns SAML metadata', async () => {
      const request = new NextRequest(
        new URL(`http://localhost/api/organizations/${mockOrgId}/sso/metadata`)
      );

      const response = await GET(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('url');
      expect(data).toHaveProperty('entity_id');
      expect(data).toHaveProperty('xml');
      expect(data.url).toContain(mockOrgId);
      expect(data.entity_id).toContain(mockOrgId);
      expect(data.xml).toContain(mockOrgId);
    });
  });

  describe('PUT /api/organizations/[orgId]/sso/settings', () => {
    it('updates SSO settings successfully', async () => {
      const newSettings = {
        sso_enabled: true,
        idp_type: 'saml',
      };

      const request = new NextRequest(
        new URL(`http://localhost/api/organizations/${mockOrgId}/sso/settings`),
        {
          method: 'PUT',
          body: JSON.stringify(newSettings),
        }
      );

      const response = await PUT(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(newSettings);

      // Verify settings were stored by making a GET request
      const getRequest = new NextRequest(
        new URL(`http://localhost/api/organizations/${mockOrgId}/sso/settings`)
      );
      const getResponse = await GET(getRequest, mockParams);
      const getdata = await getResponse.json();

      expect(getdata).toEqual(newSettings);
    });

    it('validates SSO settings', async () => {
      const invalidSettings = {
        sso_enabled: 'not-a-boolean',
        idp_type: 'invalid-type',
      };

      const request = new NextRequest(
        new URL(`http://localhost/api/organizations/${mockOrgId}/sso/settings`),
        {
          method: 'PUT',
          body: JSON.stringify(invalidSettings),
        }
      );

      const response = await PUT(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Invalid request body');
    });

    it('initializes status when enabling SSO', async () => {
      const newSettings = {
        sso_enabled: true,
        idp_type: 'oidc',
      };

      const request = new NextRequest(
        new URL(`http://localhost/api/organizations/${mockOrgId}/sso/settings`),
        {
          method: 'PUT',
          body: JSON.stringify(newSettings),
        }
      );

      await PUT(request, mockParams);

      // Check if status was initialized
      const statusRequest = new NextRequest(
        new URL(`http://localhost/api/organizations/${mockOrgId}/sso/status`)
      );
      const statusResponse = await GET(statusRequest, mockParams);
      const statusData = await statusResponse.json();

      expect(statusData).toEqual({
        status: 'healthy',
        lastSuccessfulLogin: null,
        lastError: null,
        totalSuccessfulLogins24h: 0,
      });
    });
  });
}); 