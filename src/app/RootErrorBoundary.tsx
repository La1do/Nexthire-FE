import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type RootErrorBoundaryProps = {
  children: ReactNode
}

type RootErrorBoundaryState = {
  errorMessage: string | null
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return 'Unknown render error'
}

export class RootErrorBoundary extends Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = {
    errorMessage: null,
  }

  static getDerivedStateFromError(error: unknown): RootErrorBoundaryState {
    return {
      errorMessage: getErrorMessage(error),
    }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error('[NexHire] React render failed', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.assign('/')
  }

  render() {
    if (!this.state.errorMessage) {
      return this.props.children
    }

    return (
      <main className="root-error-boundary" role="alert">
        <section className="root-error-boundary__card">
          <span className="root-error-boundary__eyebrow">NexHire</span>
          <h1>Trang đang gặp lỗi hiển thị.</h1>
          <p>
            App đã bắt được lỗi render thay vì để màn hình trắng. Bạn có thể tải lại trang
            hoặc quay về trang chủ.
          </p>
          <code>{this.state.errorMessage}</code>
          <div className="root-error-boundary__actions">
            <button onClick={this.handleReload} type="button">
              Tải lại trang
            </button>
            <button onClick={this.handleGoHome} type="button">
              Về trang chủ
            </button>
          </div>
        </section>
      </main>
    )
  }
}
