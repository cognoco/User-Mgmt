"use client";

import React, { Suspense } from "react";
const ApiErrorAlert = React.lazy(() => import("./ApiErrorAlert"));
import { useGlobalError, useErrorStore } from "@/lib/state/errorStore";

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

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full">
      <Suspense fallback={null}>
        <ApiErrorAlert
          message={error.message}
          onRetry={error.onRetry ? handleRetry : undefined}
        />
      </Suspense>
    </div>
  );
}
export default GlobalErrorDisplay;
