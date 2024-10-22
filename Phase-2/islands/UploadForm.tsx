import { useState } from "preact/hooks";

export default function UploadForm() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>("");

    // Handle file input change
    const handleFileChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            setSelectedFile(target.files[0]); // Set the selected file
        }
    };

    // Handle file upload on form submission
    const handleUpload = async (event: Event) => {
        event.preventDefault();

        if (!selectedFile) {
            setUploadStatus("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("package", selectedFile);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("File upload failed");
            }

            const result = await response.json();
            setUploadStatus(`Upload successful: ${result.message}`);
        } catch (error) {
            console.error("Error uploading file:", error);
            setUploadStatus("Error uploading file.");
        }
    };

    return (
        <form onSubmit={handleUpload} className = "upload-form">
            <div>
                <label htmlFor="file" className = "upload-label">Select a package (zip file):</label>
                <input
                    type="file"
                    id="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className = "upload-input"
                />
                {selectedFile && (
                    <div className="file-info">
                        <p><strong>File Size:</strong> {(selectedFile.size / (1000000)).toFixed(2)} MB</p>
                    </div>
                )}
            </div>

            

            <button type="submit" className = "upload-button">Upload Package</button>

            {uploadStatus && <p>{uploadStatus}</p>}
        </form>
    );
}
