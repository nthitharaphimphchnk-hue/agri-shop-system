import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Use inline styles to ensure error message is visible even if CSS fails to load
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#ffffff',
          color: '#000000',
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '800px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', color: '#dc2626' }}>
              ⚠️
            </div>

            <h2 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 'bold' }}>
              An unexpected error occurred.
            </h2>

            <div style={{
              padding: '16px',
              width: '100%',
              borderRadius: '8px',
              backgroundColor: '#f5f5f5',
              overflow: 'auto',
              marginBottom: '20px'
            }}>
              <pre style={{
                fontSize: '12px',
                color: '#666',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error?.stack || this.state.error?.message || 'Unknown error'}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#007bff',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
