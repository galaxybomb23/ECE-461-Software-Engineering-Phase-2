// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $admin from "./routes/admin.tsx";
import * as $api_index from "./routes/api-index.tsx";
import * as $api_authenticate from "./routes/api/authenticate.ts";
import * as $api_joke from "./routes/api/joke.ts";
import * as $api_package_id_ from "./routes/api/package/[id].ts";
import * as $api_package_id_cost from "./routes/api/package/[id]/cost.ts";
import * as $api_package_id_rate from "./routes/api/package/[id]/rate.ts";
import * as $api_package_byName_name_ from "./routes/api/package/byName/[name].ts";
import * as $api_package_byRegEx from "./routes/api/package/byRegEx.ts";
import * as $api_packages from "./routes/api/packages.ts";
import * as $api_reset from "./routes/api/reset.ts";
import * as $api_tracks from "./routes/api/tracks.ts";
import * as $greet_name_ from "./routes/greet/[name].tsx";
import * as $index from "./routes/index.tsx";
import * as $login from "./routes/login.tsx";
import * as $package_id_ from "./routes/package/[id].tsx";
import * as $search_results from "./routes/search-results.tsx";
import * as $upload from "./routes/upload.tsx";
import * as $Admin from "./islands/Admin.tsx";
import * as $GroupManagement from "./islands/GroupManagement.tsx";
import * as $LoginForm from "./islands/LoginForm.tsx";
import * as $Pagination from "./islands/Pagination.tsx";
import * as $PermissionManagement from "./islands/PermissionManagement.tsx";
import * as $SearchBar from "./islands/SearchBar.tsx";
import * as $UpdateForm from "./islands/UpdateForm.tsx";
import * as $UploadForm from "./islands/UploadForm.tsx";
import * as $UserManagement from "./islands/UserManagement.tsx";
import type { Manifest } from "$fresh/server.ts";

const manifest = {
	routes: {
		"./routes/_404.tsx": $_404,
		"./routes/_app.tsx": $_app,
		"./routes/admin.tsx": $admin,
		"./routes/api-index.tsx": $api_index,
		"./routes/api/authenticate.ts": $api_authenticate,
		"./routes/api/joke.ts": $api_joke,
		"./routes/api/package/[id].ts": $api_package_id_,
		"./routes/api/package/[id]/cost.ts": $api_package_id_cost,
		"./routes/api/package/[id]/rate.ts": $api_package_id_rate,
		"./routes/api/package/byName/[name].ts": $api_package_byName_name_,
		"./routes/api/package/byRegEx.ts": $api_package_byRegEx,
		"./routes/api/packages.ts": $api_packages,
		"./routes/api/reset.ts": $api_reset,
		"./routes/api/tracks.ts": $api_tracks,
		"./routes/greet/[name].tsx": $greet_name_,
		"./routes/index.tsx": $index,
		"./routes/login.tsx": $login,
		"./routes/package/[id].tsx": $package_id_,
		"./routes/search-results.tsx": $search_results,
		"./routes/upload.tsx": $upload,
	},
	islands: {
		"./islands/Admin.tsx": $Admin,
		"./islands/GroupManagement.tsx": $GroupManagement,
		"./islands/LoginForm.tsx": $LoginForm,
		"./islands/Pagination.tsx": $Pagination,
		"./islands/PermissionManagement.tsx": $PermissionManagement,
		"./islands/SearchBar.tsx": $SearchBar,
		"./islands/UpdateForm.tsx": $UpdateForm,
		"./islands/UploadForm.tsx": $UploadForm,
		"./islands/UserManagement.tsx": $UserManagement,
	},
	baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
