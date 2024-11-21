import { useState } from "preact/hooks";
import UpdateForm from "~/islands/UpdateForm.tsx";

interface UpdateButtonProps {
	metadata: {
		Name: string;
		Version: string;
		ID: string;
	};
}

export default function UpdateButton({ metadata }: UpdateButtonProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = () => setIsModalOpen(true);
	const closeModal = () => setIsModalOpen(false);

	return (
		<div>
			<button className="update-button" onClick={openModal}>
				Update Package
			</button>

			{isModalOpen && (
				<div className="modal-overlay">
					<div className="modal">
						<button className="close-button" onClick={closeModal}>
							&times;
						</button>
						<UpdateForm metadata={metadata} />
					</div>
				</div>
			)}
		</div>
	);
}
