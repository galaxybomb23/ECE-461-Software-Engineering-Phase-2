import UploadForm from "~/islands/UploadForm.tsx";
import UpdateForm from "~/islands/UpdateForm.tsx";
import Navbar from "~/components/Navbar.tsx";

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
				
				<div className="vertical-container">
					{/*Update Form */}
					<div className="title">Update a package</div>
					<UpdateForm />
				</div>
			</div>
		</div>
	);
}
