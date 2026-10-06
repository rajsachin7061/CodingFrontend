/* eslint-disable react/prop-types */
function LoadingState({
  label = "Loading...",
  error,
  onRetry,
  compact = false,
  skeleton = "",
}) {
  if (error) {
    return (
      <div
        aria-live="assertive"
        className={`loading-state loading-state-error${compact ? " is-compact" : ""}`}
        role="alert"
      >
        <p>{error}</p>
        {onRetry && (
          <button className="loading-retry" onClick={onRetry} type="button">
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      className={`loading-state${compact ? " is-compact" : ""}${skeleton ? " has-skeleton" : ""}`}
      role="status"
    >
      <span aria-hidden="true" className="loading-spinner" />
      <span>{label}</span>
      {skeleton === "dashboard" && (
        <div aria-hidden="true" className="loading-skeleton-dashboard">
          <span />
          <div>
            <span />
            <span />
            <span />
          </div>
          <span />
        </div>
      )}
      {skeleton === "profile" && (
        <div aria-hidden="true" className="loading-skeleton-profile">
          <span />
          <div>
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadingState;
