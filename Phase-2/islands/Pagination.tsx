import { useState } from "preact/hooks";
import { PackageMetadata } from "~/types/index.ts";

export default function Pagination({ packages }: { packages: PackageMetadata[] }) {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	// Calculate total pages
	const totalPages = Math.ceil(packages.length / itemsPerPage);

	// Get the packages for the current page
	const paginatedPackages = packages.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const handleNext = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevious = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	return (
		<div>
			<div className="package-list">
				{paginatedPackages.map((pkg) => (
					<div className="card" key={pkg.ID}>
						<a href={`/package/${pkg.ID}`}>
							<strong className="package-name">{pkg.Name}</strong>
						</a>
						<p className="package-version">Version: {pkg.Version}</p>
					</div>
				))}
			</div>

			{/* Pagination controls */}
			<div className="pagination-controls">
				<button onClick={handlePrevious} disabled={currentPage === 1}>
					Previous
				</button>
				<span className="page-info">
					Page {currentPage} of {totalPages}
				</span>
				<button onClick={handleNext} disabled={currentPage === totalPages}>
					Next
				</button>
			</div>
		</div>
	);
}
