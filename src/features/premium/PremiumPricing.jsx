/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api";
import { pageRoutes } from "../../pageRoutes";
import MyPremiumAccess from "./MyPremiumAccess";
import PaymentFailed from "./PaymentFailed";
import PaymentSuccess from "./PaymentSuccess";
import PremiumCard from "./PremiumCard";
import "./premium.css";

const USER_TOKEN_KEY = "onlineQuizAuthToken";
const CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

const readPayload = async (response) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "The request could not be completed.");
  }
  return payload;
};

const loadCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      `script[src="${CHECKOUT_SCRIPT_URL}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Secure checkout could not be loaded.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Secure checkout could not be loaded."));
    document.body.appendChild(script);
  });

export default function PremiumPricing({ user, onLogin, theme = "light" }) {
  const [plans, setPlans] = useState([]);
  const [access, setAccess] = useState({ modules: [], payments: [] });
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingAccess, setLoadingAccess] = useState(Boolean(user));
  const [checkoutCode, setCheckoutCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState("");

  const refreshAccess = useCallback(async () => {
    if (!user || !window.localStorage.getItem(USER_TOKEN_KEY)) {
      setAccess({ modules: [], payments: [] });
      setLoadingAccess(false);
      if (user) {
        throw new Error("Your sign-in has expired. Log in again to view premium access.");
      }
      return;
    }
    setLoadingAccess(true);
    try {
      const payload = await readPayload(
        await apiFetch("/api/premium/my-access"),
      );
      setAccess(payload);
    } finally {
      setLoadingAccess(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    apiFetch("/api/premium/plans")
      .then(readPayload)
      .then((payload) => {
        if (active) setPlans(payload.items || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoadingPlans(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshAccess().catch((requestError) => setError(requestError.message));
  }, [refreshAccess, user]);

  const ownedModules = access.modules
    .filter((module) => module.active)
    .map((module) => module.module);
  const basePrices = Object.fromEntries(
    plans.map((plan) => [plan.code, plan.amount]),
  );
  const amountForPlan = (plan) => {
    if (plan.code !== "COMPLETE") return plan.amount;
    return Math.max(
      0,
      plan.amount -
        ownedModules.reduce(
          (sum, module) => sum + (basePrices[module] || 0),
          0,
        ),
    );
  };

  const cancelOrder = async (orderId) => {
    try {
      await apiFetch("/api/premium/cancel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
    } catch (requestError) {
      console.error("Could not record cancelled premium checkout:", requestError);
    }
  };

  const purchasePlan = async (plan) => {
    setError("");
    setSuccess("");

    if (!user) {
      onLogin?.();
      return;
    }
    if (!window.localStorage.getItem(USER_TOKEN_KEY)) {
      setError("Your sign-in has expired. Log in again before purchasing.");
      return;
    }

    setCheckoutCode(plan.code);
    let orderId = "";
    try {
      const order = await readPayload(
        await apiFetch("/api/premium/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planCode: plan.code }),
        }),
      );
      orderId = order.orderId;
      await loadCheckout();

      let completed = false;
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "CodeSniper",
        description: order.plan.name,
        prefill: { email: user.email || "" },
        theme: { color: "#2563eb" },
        handler: async (result) => {
          completed = true;
          try {
            const response = await apiFetch("/api/premium/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(result),
            });
            const payload = await response.json().catch(() => ({}));
            if (response.status === 202) {
              setPending(payload.message || "Payment confirmation is pending.");
              return;
            }
            if (!response.ok) {
              throw new Error(payload.message || "Payment could not be verified.");
            }
            setSuccess(payload.message);
            await refreshAccess();
          } catch (verificationError) {
            setError(verificationError.message);
          } finally {
            setCheckoutCode("");
          }
        },
        modal: {
          ondismiss: () => {
            if (!completed) {
              void cancelOrder(orderId);
              setError("Checkout was cancelled. No premium access was granted.");
            }
            setCheckoutCode("");
          },
        },
      });
      checkout.on("payment.failed", (event) => {
        completed = true;
        setError(
          event.error?.description ||
            "The payment was not completed. You have not been charged for premium access.",
        );
        setCheckoutCode("");
      });
      checkout.open();
    } catch (checkoutError) {
      if (orderId) await cancelOrder(orderId);
      setError(checkoutError.message);
      setCheckoutCode("");
    }
  };

  return (
    <main className={`premium-page ${theme === "dark" ? "premium-page-dark" : ""}`}>
      <div className="premium-page-inner">
        <header className="premium-hero">
          <Link className="premium-back-link" to={pageRoutes.landing}>
            ← CodeSniper
          </Link>
          <span className="premium-kicker">Membership plans</span>
          <h1>Build stronger coding skills with Premium</h1>
          <p>
            Choose the learning modules you need. Each purchase activates
            independent access, so you only pay for what you don&apos;t already own.
          </p>
          {!user && (
            <p className="premium-auth-hint">
              Sign in before checkout.{" "}
              <button onClick={onLogin} type="button">Log in</button>
            </p>
          )}
        </header>

        {(error || success || pending) && (
          <div className="premium-messages">
            {error && <PaymentFailed message={error} />}
            {success && <PaymentSuccess message={success} />}
            {pending && (
              <div className="premium-notice premium-notice-pending" role="status">
                <strong>Payment confirmation pending</strong>
                <span>{pending} Access appears after Razorpay confirms capture.</span>
                <button
                  onClick={() => {
                    setPending("");
                    refreshAccess().catch((requestError) => setError(requestError.message));
                  }}
                  type="button"
                >
                  Refresh access
                </button>
              </div>
            )}
          </div>
        )}

        {loadingPlans ? (
          <p className="premium-loading" role="status">Loading premium plans…</p>
        ) : (
          <section aria-label="Premium pricing plans" className="premium-card-grid">
            {plans.map((plan) => (
              <PremiumCard
                amount={amountForPlan(plan)}
                key={plan.code}
                loading={checkoutCode === plan.code}
                disabled={Boolean(checkoutCode)}
                onPurchase={purchasePlan}
                ownedModules={ownedModules}
                plan={plan}
              />
            ))}
          </section>
        )}

        {user && (
          loadingAccess ? (
            <p className="premium-loading" role="status">Loading your access…</p>
          ) : (
            <MyPremiumAccess
              modules={access.modules}
              payments={access.payments}
            />
          )
        )}
        <p className="premium-security-note">
          Payments are verified by our server with Razorpay before any access is
          activated. Prices shown for bundle upgrades exclude modules already
          active on your account.
        </p>
      </div>
    </main>
  );
}
