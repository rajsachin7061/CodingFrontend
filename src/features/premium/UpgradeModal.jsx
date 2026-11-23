/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { pageRoutes } from "../../pageRoutes";

export default function UpgradeModal({ module = "Premium", onClose }) {
  return (
    <div
      className="premium-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="premium-upgrade-title"
        aria-modal="true"
        className="premium-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="Close upgrade dialog"
          className="premium-modal-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <span className="premium-kicker">Unlock more practice</span>
        <h2 id="premium-upgrade-title">{module} Premium is locked</h2>
        <p>
          Get advanced questions, detailed explanations, and premium learning
          resources with module-based access.
        </p>
        <Link className="premium-checkout" onClick={onClose} to={pageRoutes.premium}>
          See premium plans
        </Link>
      </section>
    </div>
  );
}
