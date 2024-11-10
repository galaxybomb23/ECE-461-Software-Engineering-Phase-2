import { useEffect } from "preact/hooks";

export default function DownloadButton({ base64Content, fileName }: { base64Content: string; fileName: string }) {
	const handleDownload = () => {
		if (base64Content) {
			const byteCharacters = atob(base64Content);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const blob = new Blob([byteArray], { type: "application/zip" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${fileName}.zip`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}
	};

	return <button onClick={handleDownload} className = "download-button">Download Package</button>;
}
