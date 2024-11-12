import { useState } from "preact/hooks";
import { APIBaseURL } from "~/types/index.ts";

export default function UploadForm() {
	const [selectedOption, setSelectedOption] = useState<"file" | "url">(
		"file",
	);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [inputUrl, setInputUrl] = useState<string>("");
	const [uploadStatus, setUploadStatus] = useState<string>("");
	const [authToken, setAuthToken] = useState<string>("");

	const [debloat, setDebloat] = useState<boolean>(false);

	// Handle file input change
	const handleFileChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			setSelectedFile(target.files[0]);
		}
	};

	// Handle URL input change
	const handleUrlChange = (event: Event) => {
		setInputUrl((event.target as HTMLInputElement).value);
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

	// Handle form submission
	const handleUpload = async (event: Event) => {
		event.preventDefault();

		if (selectedOption === "file" && !selectedFile) {
			setUploadStatus("Please select a file.");
			return;
		}

		if (selectedOption === "url" && !inputUrl) {
			setUploadStatus("Please enter a URL.");
			return;
		}

		if (!authToken) {
			setUploadStatus("Please provide the authorization token.");
			return;
		}

		try {
			const payload: {
				debloat: boolean;
				Content?: string;
				URL?: string;
			} = {
				debloat: debloat,
			};

			if (selectedOption === "file" && selectedFile) {
				const base64File = await convertFileToBase64(selectedFile);
				payload.Content = base64File;
			} else if (selectedOption === "url" && inputUrl) {
				payload.URL = inputUrl;
			}

			const headers = {
				"Content-Type": "application/json",
				"X-Authorization": authToken,
			};

			const endpoint = APIBaseURL + "/api/package";
			const method = "POST";

			// Log request details
			console.log("Request Type:", method);
			console.log("Endpoint:", endpoint);
			console.log("Headers:", headers);
			console.log("Payload:", payload);

			// Send the actual request
			const response = await fetch(endpoint, {
				method: method,
				headers: headers,
				body: JSON.stringify(payload),
			});

			console.log(response.body?.values);

			const result = await response.json();
			console.log("Response data:", result); // Log response for debugging

			if (!response.ok) {
				throw new Error(`Upload failed with status ${response.status}: ${result.message}`);
			}

			setUploadStatus(`Upload successful: Package ID ${result.metadata.ID}`);
		} catch (error) {
			console.error("Error uploading:", error);
			setUploadStatus("Error uploading.");
		}
	};

	return (
		<div className="center-wrapper">
			<form onSubmit={handleUpload} className="upload-form">
				{/* Custom Option Selector */}
				<div className="custom-selector">
					<div
						className={`selector-option ${selectedOption === "file" ? "active" : ""}`}
						onClick={() => setSelectedOption("file")}
					>
						Upload File
					</div>
					<div
						className={`selector-option ${selectedOption === "url" ? "active" : ""}`}
						onClick={() => setSelectedOption("url")}
					>
						Enter URL
					</div>
				</div>

				{selectedOption === "file"
					? (
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
					)
					: (
						<div className="url-input-row">
							<label htmlFor="url" className="upload-label">
								Enter package URL:
							</label>
							<input
								type="text"
								id="url"
								value={inputUrl}
								onChange={handleUrlChange}
								className="url-input"
							/>
						</div>
					)}

				{selectedFile && selectedOption === "file" && (
					<div className="file-info">
						<p>
							<strong>File Name:</strong> {selectedFile.name}
						</p>
						<p>
							<strong>File Size:</strong> {(selectedFile.size / 1000000).toFixed(2)} MB
						</p>
					</div>
				)}

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

				<div>
					<label htmlFor="auth-token" className="upload-label">
						Authorization Token (X-Authorization):
					</label>
					<input
						type="text"
						id="auth-token"
						value={authToken}
						onChange={(e) => setAuthToken((e.target as HTMLInputElement).value)}
						className="url-input"
					/>
				</div>

				<button type="submit" className="upload-button">
					Upload Package
				</button>

				{uploadStatus && <p>{uploadStatus}</p>}
			</form>
		</div>
	);
}
