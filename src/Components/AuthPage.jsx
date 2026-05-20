/* eslint-disable react/prop-types */
function AuthPage({
  form,
  isRegister,
  message,
  onChange,
  onForgotPassword,
  onSubmit,
  onSwitchMode,
}) {
  return (
    <main className="quiz-shell auth-shell">
      <section className="auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">Online Quiz</p>
          <h1>{isRegister ? "Create Account" : "Welcome Back"}</h1>
          <p className="hero-text">
            {isRegister
              ? "Register once, then start your quiz with your name saved for the next visit."
              : "Log in to confirm who is playing and unlock the quiz round."}
          </p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {isRegister && (
            <label>
              Full name
              <input
                autoComplete="name"
                name="name"
                onChange={onChange}
                placeholder="Enter your name"
                type="text"
                value={form.name}
              />
            </label>
          )}

          <label>
            Email
            <input
              autoComplete="email"
              name="email"
              onChange={onChange}
              placeholder="Enter your email"
              type="email"
              value={form.email}
            />
          </label>

          <label>
            Password
            <input
              autoComplete={isRegister ? "new-password" : "current-password"}
              name="password"
              onChange={onChange}
              placeholder="Enter your password"
              type="password"
              value={form.password}
            />
          </label>

          {message && <p className="form-message">{message}</p>}

          <button className="primary-action auth-submit" type="submit">
            {isRegister ? "Register" : "Login"}
          </button>

          {!isRegister && (
            <button
              className="text-action"
              onClick={onForgotPassword}
              type="button"
            >
              Forgot password?
            </button>
          )}

          <button className="text-action" onClick={onSwitchMode} type="button">
            {isRegister
              ? "Already have an account? Login"
              : "New user? Create an account"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
