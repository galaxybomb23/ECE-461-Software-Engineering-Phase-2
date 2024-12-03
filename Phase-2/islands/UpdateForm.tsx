import { useState } from "preact/hooks";
import { APIBaseURL } from "~/types/index.ts";

interface UpdateFormProps {
	metadata: {
		Name: string;
		Version: string;
		ID: string;
	};
}

export default function UpdateForm({ metadata }: UpdateFormProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadStatus, setUploadStatus] = useState<string>("");
	const [debloat, setDebloat] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	// Pre-fill metadata fields from props
	const { Name: packageName, Version: packageVersion, ID: packageID } = metadata;

	// Handle file input change
	const handleFileChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			setSelectedFile(target.files[0]);
		}
	};

	// Convert the file to Base64
	const convertFileToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve((reader.result as string).split(",")[1]);
			reader.onerror = (error) => reject(error);
		});
	};

	// Handle form submission for updating the package
	const handleUpdate = async (event: Event) => {
		event.preventDefault();

		setUploadStatus("");

		// Retrieve the auth token from cookies
		const authToken = document.cookie
			.split("; ")
			.find((row) => row.startsWith("authToken="))
			?.split("=")[1];

		if (!authToken) {
			throw new Error("User is not logged in.");
		}

		if (!selectedFile) {
			setUploadStatus("Please select a file.");
			return;
		}

		if (!authToken) {
			setUploadStatus("Please login to upload a package.");
			return;
		}

		setIsLoading(true); // Start loading indicator

		try {
			const base64File = await convertFileToBase64(selectedFile);

			const payload = {
				metadata: {
					Name: packageName,
					Version: packageVersion,
					ID: packageID,
				},
				data: {
					Content: base64File,
					debloat: debloat,
				},
			};

			const headers = {
				"Content-Type": "application/json",
				"X-Authorization": authToken,
			};

			const endpoint = `${APIBaseURL}package/${packageID}`;

			const response = await fetch(endpoint, {
				method: "POST",
				headers: headers,
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
			}

			setUploadStatus(`Update successful`);
		} catch (error) {
			console.error("Error updating package:", error);
			setUploadStatus(`Error updating package: ${(error as Error).message}`);
		} finally {
			setIsLoading(false); // Stop loading indicator
		}
	};

	return (
		<div className="center-wrapper">
			<form onSubmit={handleUpdate} className="upload-form update-form">
				{/* Metadata Fields */}
				<div>
					<label htmlFor="package-name" className="upload-label">
						Package Name:
					</label>
					<input
						type="text"
						id="package-name"
						value={packageName}
						readOnly
						className="url-input"
					/>
				</div>
				<div>
					<label htmlFor="package-version" className="upload-label">
						Package Version:
					</label>
					<input
						type="text"
						id="package-version"
						value={packageVersion}
						readOnly
						className="url-input"
					/>
				</div>
				<div>
					<label htmlFor="package-id" className="upload-label">
						Package ID:
					</label>
					<input
						type="text"
						id="package-id"
						value={packageID}
						readOnly
						className="url-input"
					/>
				</div>

				{/* File upload */}
				<div className="file-input-row">
					<label htmlFor="file" className="upload-label">
						Select a package:
					</label>
					<input
						type="file"
						id="file"
						accept=".zip"
						onChange={handleFileChange}
					/>
					<label htmlFor="file" className="upload-input">
						Select File
					</label>
				</div>

				{selectedFile && (
					<div className="file-info">
						<p>
							<strong>File Name:</strong> {selectedFile.name}
						</p>
						<p>
							<strong>File Size:</strong> {(selectedFile.size / 1000000).toFixed(2)} MB
						</p>
					</div>
				)}

				{/* Debloat Checkbox */}
				<div className="debloat-container">
					<label htmlFor="debloat" className="upload-label">
						Debloat:
					</label>
					<div
						className={`custom-checkbox ${debloat ? "checked" : ""}`}
						onClick={() => setDebloat(!debloat)}
					>
						<input
							type="checkbox"
							id="debloat"
							checked={debloat}
							onChange={() => setDebloat(!debloat)}
							className="hidden-checkbox"
						/>
						<span className="checkmark"></span>
					</div>
				</div>

				{/* Submit Button */}
				<button type="submit" className="upload-button" disabled={isLoading}>
					{isLoading ? "Updating..." : "Update Package"}
				</button>

				{/* Status Message */}
				{isLoading && <p>Loading, please wait...</p>}
				{uploadStatus && <p>{uploadStatus}</p>}
			</form>
		</div>
	);
}
