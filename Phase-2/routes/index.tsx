import Navbar from "~/components/Navbar.tsx";

export default function Home() {
	return (
		<div>
			<Navbar />
			<div className="horizontal-container">
				<div className="vertical-container">
					<div className="title">Home</div>
				</div>
			</div>
		</div>
	);
}
