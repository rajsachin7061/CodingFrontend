/* eslint-disable react/prop-types */
import { FiLock } from "react-icons/fi";

export default function PremiumLock({ module = "Premium", onUpgrade }) {
  return (
    <button
      className="premium-lock"
      onClick={onUpgrade}
      type="button"
      aria-label={`Unlock ${module} Premium`}
    >
      <FiLock aria-hidden="true" />
      <span>{module} Premium</span>
    </button>
  );
}
