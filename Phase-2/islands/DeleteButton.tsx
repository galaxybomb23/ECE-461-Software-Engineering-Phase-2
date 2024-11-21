import { useState } from "preact/hooks";
import Modal from "~/components/Modal.tsx";

export default function DeleteButton({ packageId }: { packageId: string }) {
	const [showModal, setShowModal] = useState(false);
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

	const handleDelete = async () => {
		setShowModal(false);

		try {
			// Retrieve the token from local storage
			const authToken = localStorage.getItem("authToken");

			if (!authToken) {
				throw new Error("User is not logged in.");
			}

			const response = await fetch(`/api/package/${packageId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					"X-Authorization": authToken, // Use the token from localStorage
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || "Failed to delete package.");
			}

			setFeedbackMessage("Package deleted successfully.");
			setTimeout(() => {
				globalThis.location.href = "/";
			}, 2000); // Redirect after showing the message
		} catch (error) {
			if (error instanceof Error) {
				setFeedbackMessage(
					error.message === "User is not logged in."
						? "Failed to delete package: Not logged in. Please log in and try again."
						: `Failed to delete package: ${error.message}`
				);
			} else {
				setFeedbackMessage("An unknown error occurred while deleting the package.");
			}
		}
	};

	return (
		<>
			{showModal && (
				<Modal
					title="Confirm Delete"
					message="Are you sure you want to delete this package? This action cannot be undone."
					onConfirm={handleDelete}
					onCancel={() => setShowModal(false)}
					confirmText="Delete"
					cancelText="Cancel"
				/>
			)}

			{feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}

			<button className="delete-button" onClick={() => setShowModal(true)}>
				Delete Package
			</button>
		</>
	);
}
