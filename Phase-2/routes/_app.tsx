import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
	return (
		<html>
			<head>
				<meta charset="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0"
				/>
				<title>Phase-2</title>
				<link rel="stylesheet" href="/styles.css" />
				<link rel="stylesheet" href="/SearchBar.css" />
				<link rel="stylesheet" href="/Navbar.css" />
				<link rel="stylesheet" href="/UploadForm.css" />
				<link rel="stylesheet" href="/PackageList.css" />
			</head>
			<body>
				<Component />
			</body>
		</html>
	);
}
