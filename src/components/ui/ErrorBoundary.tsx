'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/ui/primitives/button';
import { Alert, AlertTitle, AlertDescription } from '@/ui/primitives/alert';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant="destructive">
          <AlertOctagon className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              {this.state.error?.message || 'An unknown error occurred'}
            </div>
            <Button
              onClick={this.handleRetry}
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
