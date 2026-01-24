import './UpdateNotification.css';

interface UpdateNotificationProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export default function UpdateNotification({ onUpdate, onDismiss }: UpdateNotificationProps) {
  return (
    <div className="update-notification-overlay">
      <div className="window update-notification-window">
        <div className="title-bar">
          <div className="title-bar-text">Update Available</div>
          <div className="title-bar-controls">
            <button
              aria-label="Close"
              onClick={onDismiss}
            />
          </div>
        </div>
        <div className="window-body" style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
              A new version of Weather 98 is available!
            </p>
            <p style={{ margin: '0', fontSize: '12px', color: '#808080' }}>
              Click "Update Now" to reload and get the latest version.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={onDismiss}>Later</button>
            <button onClick={onUpdate}>Update Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
