/* eslint-disable react/prop-types */
function AdminLogin({ form, message, onBack, onChange, onSubmit }) {
  return (
    <main className="quiz-shell auth-shell">
      <section className="auth-panel compact-panel">
        <div className="auth-copy">
          <p className="eyebrow">Admin Access</p>
          <h1>Admin Login</h1>
          <p className="hero-text">
            Sign in with the admin account from your code to manage users and
            quiz questions.
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

          <button className="primary-action auth-submit" type="submit">
            Open Admin Panel
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
