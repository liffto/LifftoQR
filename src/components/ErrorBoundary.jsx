import { Component } from 'react'
import { reportError } from '../lib/errorTracking'

// Safety net: keeps a render error in one subtree (e.g. a QR preview) from
// blanking the entire app. Shows a small recover affordance instead.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
    // The console line is for whoever has devtools open; this is for the errors
    // nobody was watching. Queued if the SDK has not loaded yet.
    reportError(error, { componentStack: info?.componentStack })
  }

  reset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
          <h2 className="text-lg font-semibold text-ink">
            Something went wrong rendering this view.
          </h2>
          <button
            type="button"
            onClick={() => {
              this.reset()
              window.location.assign('/dashboard')
            }}
            className="rounded-[10px] bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-600"
          >
            Back to dashboard
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
