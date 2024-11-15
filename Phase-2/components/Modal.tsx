import { JSX } from "preact";

export default function Modal({
	title,
	message,
	onConfirm,
	onCancel,
	confirmText = "Confirm",
	cancelText = "Cancel",
}: {
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
	confirmText?: string;
	cancelText?: string;
}) {
	return (
		<div className="modal-overlay">
			<div className="modal-container">
				<h2 className="modal-title">{title}</h2>
				<p className="modal-message">{message}</p>
				<div className="modal-buttons">
					<button className="modal-button confirm" onClick={onConfirm}>
						{confirmText}
					</button>
					<button className="modal-button cancel" onClick={onCancel}>
						{cancelText}
					</button>
				</div>
			</div>
		</div>
	);
}
