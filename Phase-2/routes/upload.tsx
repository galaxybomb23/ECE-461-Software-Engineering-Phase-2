import UploadForm from "~/islands/UploadForm.tsx";
import UpdateForm from "~/islands/UpdateForm.tsx";
import Navbar from "../islands/Navbar.tsx";

export default function Upload() {
	return (
		<div>
			<Navbar />

			<div className="horizontal-container">
				<div className="vertical-container">
					{/*Upload Form */}
					<div className="title">Upload a package</div>
					<UploadForm />
				</div>
			</div>
		</div>
	);
}
