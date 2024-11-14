import Navbar from "~/components/Navbar.tsx";
import LoginForm from "~/islands/LoginForm.tsx";

export default function LoginPage() {
	return (
		<div>
			<Navbar />
			<div className="horizontal-container">
				<div className="vertical-container">
					<LoginForm />
				</div>
			</div>
		</div>
	);
}
