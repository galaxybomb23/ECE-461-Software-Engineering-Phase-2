import { useState } from "preact/hooks";
import { Package } from "~/types/index.ts";

export default function UpdateForm() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploadStatus, setUploadStatus] = useState<string>("");
	const [authToken, setAuthToken] = useState<string>("");
	const [packageName, setPackageName] = useState<string>("");
	const [packageVersion, setPackageVersion] = useState<string>("");
	const [packageID, setPackageID] = useState<string>("");

	const [debloat, setDebloat] = useState<boolean>(false);

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
			reader.onload = () =>
				resolve((reader.result as string).split(",")[1]);
			reader.onerror = (error) => reject(error);
		});
	};

	// Handle form submission for updating package
	const handleUpdate = async (event: Event) => {
		event.preventDefault();

		if (!selectedFile) {
			setUploadStatus("Please select a file.");
			return;
		}

		if (!authToken) {
			setUploadStatus("Please provide the authorization token.");
			return;
		}

		if (!packageName || !packageVersion || !packageID) {
			setUploadStatus("Please provide package name, version, and ID.");
			return;
		}

		try {
			const base64File = await convertFileToBase64(selectedFile);

			const payload: Package = {
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

			const endpoint = `/package/${packageID}`; // Assuming this is the path to update
			const method = "PUT";

			// Log the full request details
			console.log("Request Type:", method);
			console.log("Endpoint:", endpoint);
			console.log("Headers:", headers);
			console.log("Payload:", payload);

			// Send the update request
			const response = await fetch(endpoint, {
				method: method,
				headers: headers,
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error("Update failed");
			}

			const result = await response.json();
			setUploadStatus(
				`Update successful: Package ID ${result.metadata.ID}`,
			);
		} catch (error) {
			console.error("Error updating:", error);
			setUploadStatus("Error updating.");
		}
	};

	return (
		<div className="center-wrapper">
			<form onSubmit={handleUpdate} className="upload-form">
				{/* Fields for package name, version, and ID */}
				<div>
					<label htmlFor="package-name" className="upload-label">
						Package Name:
					</label>
					<input
						type="text"
						id="package-name"
						value={packageName}
						onChange={(e) =>
							setPackageName((e.target as HTMLInputElement).value)}
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
						onChange={(e) =>
							setPackageVersion((e.target as HTMLInputElement).value)}
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
						onChange={(e) =>
							setPackageID((e.target as HTMLInputElement).value)}
						className="url-input"
					/>
				</div>

				{/* File upload only */}
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
							<strong>File Size:</strong>{" "}
							{(selectedFile.size / 1000000).toFixed(2)} MB
						</p>
					</div>
				)}

				<div className="debloat-container">
					<label htmlFor="debloat" className="upload-label">
						Debloat:
					</label>
					<div
						className={`custom-checkbox ${
							debloat ? "checked" : ""
						}`}
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

				<div>
					<label htmlFor="auth-token" className="upload-label">
						Authorization Token (X-Authorization):
					</label>
					<input
						type="text"
						id="auth-token"
						value={authToken}
						onChange={(e) =>
							setAuthToken((e.target as HTMLInputElement).value)}
						className="url-input"
					/>
				</div>

				<button type="submit" className="upload-button">
					Update Package
				</button>

				{uploadStatus && <p>{uploadStatus}</p>}
			</form>
		</div>
	);
}
