/* eslint-disable react/prop-types */
import UserMenu from "../UserMenu";

function AccountLayout({
  children,
  onBackToQuiz,
  onLogout,
  onToggleTheme,
  pageTitle,
  showBackButton = true,
  theme,
  user,
}) {
  return (
    <main className={`quiz-shell auth-shell ${theme}-theme`}>
      <header className="user-bar" aria-label="Signed in user">
        <span>Hi, {user.name}</span>
        <div className="user-actions">
          <button className="secondary-action" onClick={onToggleTheme} type="button">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          {showBackButton && <UserMenu user={user} onLogout={onLogout} />}
        </div>
      </header>

      <section className="result-panel user-detail-panel">
        <p className="eyebrow">Account</p>
        <h1>{pageTitle}</h1>
        {children}

        {showBackButton && (
          <button className="primary-action" onClick={onBackToQuiz} type="button">
            Back to Quiz
          </button>
        )}
      </section>
    </main>
  );
}

export default AccountLayout;
