import React from 'react';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { error };
  }
  componentDidCatch(err: any, info: any) {
    console.error('[AppErrorBoundary]', err, info);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
        color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 99999
      }}>
        <div style={{ maxWidth: 720, background:'#0f172a', padding: 24, borderRadius: 12, border:'1px solid #334155' }}>
          <h2 style={{marginTop:0}}>Something went wrong</h2>
          <pre style={{ whiteSpace:'pre-wrap' }}>{String(this.state.error?.message ?? this.state.error)}</pre>
          <p style={{opacity:.8, marginTop:12}}>Open <b>/diagnostics</b> to run live checks.</p>
        </div>
      </div>
    );
  }
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: any) { console.error('[ErrorBoundary]', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16 }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error.stack || this.state.error.message)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}