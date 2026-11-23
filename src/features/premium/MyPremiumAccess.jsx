/* eslint-disable react/prop-types */
const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "No expiry";

const formatAmount = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

export default function MyPremiumAccess({ modules = [], payments = [] }) {
  return (
    <section className="premium-dashboard" aria-labelledby="premium-access-title">
      <div className="premium-section-heading">
        <div>
          <span className="premium-kicker">Your account</span>
          <h2 id="premium-access-title">My premium access</h2>
        </div>
      </div>
      <div className="premium-access-grid">
        {modules.map((item) => (
          <article className="premium-access-item" key={item.module}>
            <div>
              <strong>{item.module === "DSA" ? "DSA" : "Practice"}</strong>
              <span>{item.active ? "Premium active" : "Free access"}</span>
            </div>
            <span className={item.active ? "premium-status-active" : "premium-status-free"}>
              {item.active ? "Active" : "Available"}
            </span>
            {item.active && (
              <small>
                Purchased {formatDate(item.purchaseDate)}
                {item.expiresAt ? ` · Expires ${formatDate(item.expiresAt)}` : " · Lifetime"}
              </small>
            )}
          </article>
        ))}
      </div>
      <div className="premium-payment-history">
        <h3>Payment history</h3>
        {payments.length ? (
          <div className="premium-table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.planCode}</td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>{formatAmount(payment.amount)}</td>
                    <td>
                      <span className={`premium-payment-status status-${payment.status}`}>
                        {payment.status.replaceAll("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="premium-empty">Your completed and attempted payments will appear here.</p>
        )}
      </div>
    </section>
  );
}
