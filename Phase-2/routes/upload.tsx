import UploadForm from "../islands/UploadForm.tsx"; // Import the new UploadForm island
import Navbar from "../components/NavBar.tsx";

export default function Upload() {
    

    return (
        <div>
            <Navbar />

            <div className="title">Upload/Updating a package</div>

            {/* Render the UploadForm island */}
            <UploadForm />
        </div>
    );
}
