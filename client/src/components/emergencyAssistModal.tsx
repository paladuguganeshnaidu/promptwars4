interface EmergencyAssistModalProps {
  countdown: number;
  alertSent: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Accessible emergency confirmation dialog with a visible countdown. */
export function EmergencyAssistModal({
  countdown,
  alertSent,
  onConfirm,
  onClose,
}: EmergencyAssistModalProps): React.JSX.Element {
  return (
    <div className="sos-modal" role="dialog" aria-modal="true" aria-labelledby="sos-title">
      <div className="sos-modal__panel">
        <h2 id="sos-title">Emergency Assistance</h2>
        <p className="page-intro">
          Organizers will be alerted after the countdown reaches zero. You can confirm now or
          cancel this request.
        </p>
        <p className="sos-modal__countdown" aria-live="polite">
          Alert dispatches in {countdown} seconds.
        </p>
        {alertSent ? <p className="status-message">Alert sent to organizers.</p> : null}
        <div className="form-actions sos-modal__actions">
          <button type="button" className="button" onClick={onConfirm}>
            Confirm alert now
          </button>
          <button type="button" className="button button--secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}