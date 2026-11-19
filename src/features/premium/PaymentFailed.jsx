/* eslint-disable react/prop-types */
export default function PaymentFailed({ message }) {
  return (
    <div className="premium-notice premium-notice-error" role="alert">
      <strong>Payment not completed</strong>
      <span>{message}</span>
    </div>
  );
}
