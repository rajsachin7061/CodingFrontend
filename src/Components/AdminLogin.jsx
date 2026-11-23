/* eslint-disable react/prop-types */
function AdminLogin({ form, isLoading, message, onBack, onChange, onSubmit }) {
  return (
    <main className="quiz-shell auth-shell">
      <section className="auth-panel compact-panel">
        <div className="auth-copy">
          <p className="eyebrow">Admin Access</p>
          <h1>Admin Login</h1>
          <p className="hero-text">
            Sign in with the administrator account configured on the server.
          </p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Username
            <input
              autoComplete="username"
              name="username"
              onChange={onChange}
              placeholder="Enter admin username"
              type="text"
              value={form.username}
            />
          </label>

          <label>
            Password
            <input
              autoComplete="current-password"
              name="password"
              onChange={onChange}
              placeholder="Enter admin password"
              type="password"
              value={form.password}
            />
          </label>

          {message && <p className="form-message">{message}</p>}

          <button
            className="primary-action auth-submit"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Signing in..." : "Open Admin Panel"}
          </button>

          <button className="text-action" onClick={onBack} type="button">
            Back
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminLogin;
