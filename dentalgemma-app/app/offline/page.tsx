'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">You&apos;re Offline</h1>
        <p className="text-muted-foreground mb-8">
          It looks like you&apos;ve lost your internet connection. Some features require an active connection to work.
        </p>
        <div className="space-y-4">
          <p className="text-sm">Available offline:</p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>✓ Treatment Progress Tracker</li>
            <li>✓ Symptom Checker (basic)</li>
            <li>✓ Patient Education (cached content)</li>
            <li>✓ Analysis History</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
