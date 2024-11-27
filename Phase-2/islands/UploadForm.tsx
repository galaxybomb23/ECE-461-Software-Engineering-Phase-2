import { useState } from "preact/hooks";
import { APIBaseURL } from "~/types/index.ts";

export default function UploadForm() {
	const [selectedOption, setSelectedOption] = useState<"file" | "url">("file");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [inputUrl, setInputUrl] = useState<string>("");
	const [uploadStatus, setUploadStatus] = useState<string>("");
	const [debloat, setDebloat] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state

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

		// Clear the status message each time the upload begins
		setUploadStatus("");

		// Retrieve the auth token from cookies
		const authToken = document.cookie
			.split("; ")
			.find((row) => row.startsWith("authToken="))
			?.split("=")[1];

		if (!authToken) {
			throw new Error("User is not logged in.");
		}

		if (selectedOption === "file" && !selectedFile) {
			setUploadStatus("Please select a file.");
			return;
		}

		if (selectedOption === "url" && !inputUrl) {
			setUploadStatus("Please enter a URL.");
			return;
		}

		if (!authToken) {
			setUploadStatus("Please log in to upload packages.");
			return;
		}

		setIsLoading(true); // Set loading to true when upload starts

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
			const response = await fetch(endpoint, {
				method: "POST",
				headers: headers,
				body: JSON.stringify(payload),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(`Upload failed with status ${response.status}: ${result.message}`);
			}

			setUploadStatus(`Upload successful: Package ID ${result.metadata.ID}`);
		} catch (error) {
			console.error("Error uploading:", error);
			setUploadStatus(`Error uploading. ${(error as Error).message}`);
		} finally {
			setIsLoading(false); // Set loading to false after upload completes
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

				<button type="submit" className="upload-button" disabled={isLoading}>
					{isLoading ? "Uploading..." : "Upload Package"}
				</button>

				{isLoading && <p>Loading, please wait...</p>} {/* Loading indicator */}
				{uploadStatus && <p>{uploadStatus}</p>}
			</form>
		</div>
	);
}
