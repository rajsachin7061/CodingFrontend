/* eslint-disable react/prop-types */
export default function PaymentSuccess({ message }) {
  return (
    <div className="premium-notice premium-notice-success" role="status">
      <strong>Payment confirmed</strong>
      <span>{message}</span>
    </div>
  );
}
