import Navbar from "~/components/Navbar.tsx";
import LoginForm from "~/islands/LoginForm.tsx";

export default function LoginPage() {
	return (
		<div>
			<Navbar />
			<div className="horizontal-container">
				<LoginForm />
				<div className="vertical-container">
					<div className="title">Login</div>
				</div>
			</div>
		</div>
	);
}
