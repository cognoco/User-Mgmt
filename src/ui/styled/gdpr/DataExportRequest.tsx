"use client";

import { Button } from "@/ui/primitives/button";
import { Alert, AlertDescription } from "@/ui/primitives/alert";
import { DataExportRequest as HeadlessDataExportRequest } from "@/src/ui/headless/gdpr/DataExportRequest";

export function DataExportRequest() {
  return (
    <HeadlessDataExportRequest
      render={({ requestExport, isLoading, error }) => (
        <div className="space-y-2">
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={requestExport} disabled={isLoading}>
            {isLoading ? "Exporting..." : "Export My Data"}
          </Button>
        </div>
      )}
    />
  );
}

export default DataExportRequest;
