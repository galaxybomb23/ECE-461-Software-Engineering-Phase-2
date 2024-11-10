import Navbar from "~/components/Navbar.tsx";
import Pagination from "~/islands/Pagination.tsx"; // Import the Pagination island
import { PackageMetadata } from "~/types/index.ts";

// Sample package data
const samplePackages: PackageMetadata[] = [
	{ Version: "1.2.3", Name: "Underscore", ID: "underscore" },
	{ Version: "1.2.3-2.1.0", Name: "Lodash", ID: "lodash" },
	{ Version: "^1.2.3", Name: "React", ID: "react" },
	{ Version: "2.0.0", Name: "Vue", ID: "vue" },
	{ Version: "3.0.0", Name: "Angular", ID: "angular" },
	{ Version: "4.0.0", Name: "Svelte", ID: "svelte" },
	{ Version: "1.1.1", Name: "Deno", ID: "deno" },
	{ Version: "5.6.7", Name: "SuperAwesomeJavaScriptFrameworkWithExtraFeatures", ID: "superawesome-js" },
	{ Version: "1.2.3", Name: "TailwindCSS", ID: "tailwindcss" },
	{ Version: "8.5.0", Name: "Express", ID: "express" },
	{ Version: "4.17.1", Name: "Jest", ID: "jest" },
	{ Version: "10.0.0", Name: "TypeScript", ID: "typescript" },
	{ Version: "6.14.11", Name: "NPM", ID: "npm" },
	{ Version: "3.9.2", Name: "Axios", ID: "axios" },
	{ Version: "5.7.1", Name: "Fastify", ID: "fastify" },
	{ Version: "1.0.0", Name: "Next.js", ID: "nextjs" },
	{ Version: "2.6.3", Name: "Gatsby", ID: "gatsby" },
	{ Version: "9.0.0", Name: "Puppeteer", ID: "puppeteer" },
	{ Version: "3.0.0", Name: "Chai", ID: "chai" },
	{ Version: "5.0.0", Name: "Mocha", ID: "mocha" },
	{ Version: "1.0.0", Name: "ExtraOrdinarilyLongPackageNameThatGoesOnForeverToTestWrapping", ID: "longpackage1" },
	{ Version: "1.0.0", Name: "ShortPkg", ID: "shortpkg" },
	{ Version: "6.0.1", Name: "ApolloGraphQL", ID: "apollographql" },
	{ Version: "7.3.2", Name: "PrismaORM", ID: "prismaorm" },
	{ Version: "2.1.0", Name: "ReduxToolkit", ID: "reduxtoolkit" },
	{ Version: "4.0.2", Name: "EmotionCSS", ID: "emotioncss" },
	{ Version: "1.2.0", Name: "StyledComponents", ID: "styledcomponents" },
	{ Version: "3.5.1", Name: "Ramda", ID: "ramda" },
	{ Version: "8.1.3", Name: "JQuery", ID: "jquery" },
	{ Version: "2.2.1", Name: "Chart.js", ID: "chartjs" },
	{ Version: "1.0.0", Name: "Formidable", ID: "formidable" },
];

export default function Home() {
	return (
		<div>
			<Navbar />
			<div className="horizontal-container">
				<div className="vertical-container">
					<div className="title">Home</div>
					<Pagination packages={samplePackages} />
				</div>
			</div>
		</div>
	);
}
