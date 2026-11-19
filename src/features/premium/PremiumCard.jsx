/* eslint-disable react/prop-types */
import PremiumBadge from "./PremiumBadge";
import PremiumCheckout from "./PremiumCheckout";

const formatPrice = (paise) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(paise / 100));

export default function PremiumCard({
  plan,
  ownedModules = [],
  amount,
  loading = false,
  disabled = false,
  onPurchase,
}) {
  const active = plan.modules.every((module) => ownedModules.includes(module));
  const highlighted = plan.code === "COMPLETE";

  return (
    <article
      className={`premium-card${highlighted ? " premium-card-highlighted" : ""}`}
    >
      {highlighted && <span className="premium-best-value">Best value</span>}
      <PremiumBadge module={plan.code === "COMPLETE" ? "Complete" : plan.name.split(" ")[0]} />
      <h2>{plan.name}</h2>
      <p className="premium-card-summary">
        {plan.modules.length === 2
          ? "Full access to both premium learning modules."
          : `Unlock focused ${plan.modules[0]} learning and practice.`}
      </p>
      <div className="premium-price">
        <span aria-label={`${formatPrice(amount)} rupees`}>₹{formatPrice(amount)}</span>
        <small>one-time payment</small>
      </div>
      <ul className="premium-feature-list">
        {plan.features.map((feature) => (
          <li key={feature}>
            <span aria-hidden="true">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      {active ? (
        <div className="premium-active-label" role="status">
          Active · Purchased
        </div>
      ) : (
        <PremiumCheckout
          label={`Unlock ${plan.code === "COMPLETE" ? "Complete Premium" : `${plan.name.split(" ")[0]} Premium`} – ₹${formatPrice(amount)}`}
          loading={loading}
          disabled={disabled}
          onClick={() => onPurchase(plan)}
        />
      )}
      <p className="premium-card-footnote">
        {active
          ? "Your access is active for this account."
          : "Secure checkout powered by Razorpay."}
      </p>
    </article>
  );
}
