/* eslint-disable react/prop-types */
export default function PremiumCheckout({
  disabled = false,
  loading = false,
  label,
  onClick,
}) {
  return (
    <button
      className="premium-checkout"
      disabled={disabled || loading}
      onClick={onClick}
      type="button"
    >
      {loading ? "Preparing secure checkout..." : label}
    </button>
  );
}
