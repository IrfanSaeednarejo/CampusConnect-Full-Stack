import React from 'react';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the app and logs them
 * Displays fallback UI instead of crashing the entire app
 * 
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState((prev) => ({
      error,
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    // Log to external service in production
    // logErrorToService(error, errorInfo);
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#0d1117]">
          <div className="max-w-md w-full bg-[#161b22] rounded-lg p-8 border border-[#30363d]">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-900/20 mx-auto mb-4">
              <span className="material-symbols-outlined text-red-500">error</span>
            </div>
            
            <h1 className="text-2xl font-bold text-[#c9d1d9] text-center mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-[#8b949e] text-center text-sm mb-4">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-3 bg-[#0d1117] rounded border border-[#30363d] text-xs">
                <p className="font-mono text-red-400 break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2 text-[#8b949e] text-xs">
                    <summary className="cursor-pointer font-semibold text-[#c9d1d9]">
                      Error Details
                    </summary>
                    <pre className="mt-2 overflow-auto max-h-48 whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-[#238636] text-white text-sm font-semibold rounded-md hover:bg-[#2ea043] transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={this.reset}
                className="flex-1 px-4 py-2 bg-[#30363d] text-[#c9d1d9] text-sm font-semibold rounded-md hover:bg-[#3d444d] transition-colors"
              >
                Try Again
              </button>
            </div>

            <p className="text-[#8b949e] text-xs text-center mt-4">
              Error occurred {this.state.errorCount} time{this.state.errorCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
