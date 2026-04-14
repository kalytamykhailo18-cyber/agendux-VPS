export default function Toast({ message, isError }) {
  return (
    <div className={`toast ${isError ? 'toast-error' : 'toast-success'}`}>
      {message}
    </div>
  );
}
