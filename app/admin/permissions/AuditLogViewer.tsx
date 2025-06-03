'use client';
import { AuditLogViewer as StyledAuditLogViewer } from '@/ui/styled/audit/AuditLogViewer';

export default function AuditLogViewer() {
  return <StyledAuditLogViewer isAdmin={true} />;
}
