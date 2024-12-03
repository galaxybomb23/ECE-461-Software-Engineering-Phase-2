// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $admin from "./routes/admin.tsx";
import * as $api_authenticate from "./routes/api/authenticate.ts";
import * as $api_joke from "./routes/api/joke.ts";
import * as $api_package from "./routes/api/package.ts";
import * as $api_package_id_ from "./routes/api/package/[id].ts";
import * as $api_package_id_cost from "./routes/api/package/[id]/cost.ts";
import * as $api_package_id_rate from "./routes/api/package/[id]/rate.ts";
import * as $api_package_byName_name_ from "./routes/api/package/byName/[name].ts";
import * as $api_package_byRegEx from "./routes/api/package/byRegEx.ts";
import * as $api_packages from "./routes/api/packages.ts";
import * as $api_reset from "./routes/api/reset.ts";
import * as $api_tracks from "./routes/api/tracks.ts";
import * as $api_users from "./routes/api/users.ts";
import * as $api_users_username_ from "./routes/api/users/[username].ts";
import * as $greet_name_ from "./routes/greet/[name].tsx";
import * as $index from "./routes/index.tsx";
import * as $login from "./routes/login.tsx";
import * as $package_id_ from "./routes/package/[id].tsx";
import * as $package_byRegEx_regex_ from "./routes/package/byRegEx/[regex].tsx";
import * as $upload from "./routes/upload.tsx";
import * as $Admin from "./islands/Admin.tsx";
import * as $DeleteButton from "./islands/DeleteButton.tsx";
import * as $DownloadButton from "./islands/DownloadButton.tsx";
import * as $LoginForm from "./islands/LoginForm.tsx";
import * as $Navbar from "./islands/Navbar.tsx";
import * as $Pagination from "./islands/Pagination.tsx";
import * as $SearchBar from "./islands/SearchBar.tsx";
import * as $UpdateButton from "./islands/UpdateButton.tsx";
import * as $UpdateForm from "./islands/UpdateForm.tsx";
import * as $UploadForm from "./islands/UploadForm.tsx";
import * as $UserManagement from "./islands/UserManagement.tsx";
import type { Manifest } from "$fresh/server.ts";

const manifest = {
	routes: {
		"./routes/_404.tsx": $_404,
		"./routes/_app.tsx": $_app,
		"./routes/admin.tsx": $admin,
		"./routes/api/authenticate.ts": $api_authenticate,
		"./routes/api/joke.ts": $api_joke,
		"./routes/api/package.ts": $api_package,
		"./routes/api/package/[id].ts": $api_package_id_,
		"./routes/api/package/[id]/cost.ts": $api_package_id_cost,
		"./routes/api/package/[id]/rate.ts": $api_package_id_rate,
		"./routes/api/package/byName/[name].ts": $api_package_byName_name_,
		"./routes/api/package/byRegEx.ts": $api_package_byRegEx,
		"./routes/api/packages.ts": $api_packages,
		"./routes/api/reset.ts": $api_reset,
		"./routes/api/tracks.ts": $api_tracks,
		"./routes/api/users.ts": $api_users,
		"./routes/api/users/[username].ts": $api_users_username_,
		"./routes/greet/[name].tsx": $greet_name_,
		"./routes/index.tsx": $index,
		"./routes/login.tsx": $login,
		"./routes/package/[id].tsx": $package_id_,
		"./routes/package/byRegEx/[regex].tsx": $package_byRegEx_regex_,
		"./routes/upload.tsx": $upload,
	},
	islands: {
		"./islands/Admin.tsx": $Admin,
		"./islands/DeleteButton.tsx": $DeleteButton,
		"./islands/DownloadButton.tsx": $DownloadButton,
		"./islands/LoginForm.tsx": $LoginForm,
		"./islands/Navbar.tsx": $Navbar,
		"./islands/Pagination.tsx": $Pagination,
		"./islands/SearchBar.tsx": $SearchBar,
		"./islands/UpdateButton.tsx": $UpdateButton,
		"./islands/UpdateForm.tsx": $UpdateForm,
		"./islands/UploadForm.tsx": $UploadForm,
		"./islands/UserManagement.tsx": $UserManagement,
	},
	baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
