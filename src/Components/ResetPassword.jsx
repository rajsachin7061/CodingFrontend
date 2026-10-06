/* eslint-disable react/prop-types */
function ResetPassword({
  form,
  message,
  isLoading,
  onBack,
  onChange,
  onSendOtp,
  onSubmit,
  resetStep,
}) {
  const isOtpStep = resetStep === "otp";

  return (
    <main className="quiz-shell auth-shell">
      <section className="auth-panel compact-panel">
        <div className="auth-copy">
          <p className="eyebrow">Account Help</p>
          <h1>Reset Password</h1>
          <p className="hero-text">
            {isOtpStep
              ? "Enter the OTP sent to your email, then choose your new password."
              : "Enter your registered email and receive an OTP to reset your quiz account password."}
          </p>
        </div>

        <form className="auth-form" onSubmit={isOtpStep ? onSubmit : onSendOtp}>
          <label>
            Email
            <input
              autoComplete="email"
              disabled={isOtpStep || isLoading}
              name="email"
              onChange={onChange}
              placeholder="Enter your registered email"
              type="email"
              value={form.email}
            />
          </label>

          {isOtpStep && (
            <>
              <label>
                OTP
                <input
                  autoComplete="one-time-code"
                  disabled={isLoading}
                  inputMode="numeric"
                  maxLength="6"
                  name="otp"
                  onChange={onChange}
                  placeholder="Enter 6 digit OTP"
                  type="text"
                  value={form.otp}
                />
              </label>

              <label>
                New password
                <input
                  autoComplete="new-password"
                  disabled={isLoading}
                  name="password"
                  onChange={onChange}
                  placeholder="Enter new password"
                  type="password"
                  value={form.password}
                />
              </label>
            </>
          )}

          {message && (
            <p className="form-message" role="alert">
              {message}
            </p>
          )}

          <button
            className="primary-action auth-submit"
            disabled={isLoading}
            type="submit"
          >
            <span className="auth-submit-content">
              {isLoading && <span aria-hidden="true" className="button-spinner" />}
              {isLoading
                ? isOtpStep
                  ? "Updating password..."
                  : "Sending OTP..."
                : isOtpStep
                  ? "Update Password"
                  : "Send OTP"}
            </span>
          </button>

          {isOtpStep && (
            <button
              className="text-action"
              disabled={isLoading}
              onClick={onSendOtp}
              type="button"
            >
              Send new OTP
            </button>
          )}

          <button
            className="text-action"
            disabled={isLoading}
            onClick={onBack}
            type="button"
          >
            Back to login
          </button>
        </form>
      </section>
    </main>
  );
}

export default ResetPassword;
