import { signal } from "@preact/signals";

export default function Login() {
	return (
		<div>
			<div>
				<nav className="navbar">
					<ul>
						<li>
							<a href="/">Home</a>
						</li>
						<li>
							<a href="/login">Login</a>
						</li>
						<li>
							<a href="/admin">Admin</a>
						</li>
					</ul>
				</nav>
			</div>
			<div className="title">
				Login
			</div>
		</div>
	);
}
