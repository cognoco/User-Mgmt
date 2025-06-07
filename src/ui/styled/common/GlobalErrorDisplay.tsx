"use client";

import React, { Suspense } from "react";
import { DevErrorDetailsPanel } from '@/src/ui/styled/common/DevErrorDetailsPanel';
import { getClientConfig } from '@/core/config/runtimeConfig';
import { useGlobalError, useErrorStore } from "@/lib/state/errorStore";

const ApiErrorAlert = React.lazy(() => import("@/src/ui/styled/common/ApiErrorAlert"));

export function GlobalErrorDisplay() {
  const error = useGlobalError();
  const removeError = useErrorStore((state) => state.removeError);
  
  if (!error) return null;
  
  const handleRetry = async () => {
    if (error.onRetry) {
      await error.onRetry();
    }
    removeError(error.id);
  };
  
  const showDetails = getClientConfig().env.showErrorDetails;
  
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 max-w-md w-full">
        <Suspense fallback={null}>
          <ApiErrorAlert
            message={error.message}
            onRetry={error.onRetry ? handleRetry : undefined}
            severity={error.severity}
          />
        </Suspense>
      </div>
      {showDetails && <DevErrorDetailsPanel error={error} />}
    </>
  );
}

export default GlobalErrorDisplay;
