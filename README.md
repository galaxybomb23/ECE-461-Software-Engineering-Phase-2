Deno Documentation: https://docs.deno.com/


Requirements:
Here's the table rewritten as a markdown checklist:

- [x] **Upload, Update, Download, and Delete Packages**
  - The system must allow the upload, update, and download of NPM modules, along with checking the package rating. A user should also be able to delete a package by ID.

- [ ] **Debloat Options for Upload and Update**
  - Remove unnecessary bloat from a package using tree-shaking and/or minification.

- [x] **Rate Packages/New Modules**
  - The system should compute a rating based on code from phase 1 as well as 2 new metrics:
    - Fraction of dependencies pinned to at least a specific major+minor version, e.g., version 2.3.X of the dependency.
    - Fraction of project code introduced through pull requests with a code review.

- [x] **Fetch Versions**
  - Support fetching package versions based on exact or ranged versions.

- [x] **Request Public NPM Packages**
  - Add a feature to request the ingestion of public npm packages.
    - Package must score 0.5 on each of the non-latency metrics from the “rate” behavior. If ingestible, proceed to package upload.

- [ ] **Search and Fetch Directory/Package**
  - Provide a way to search for packages and fetch a directory of packages.
  - Search for packages through package name and README.
  - Search and fetch packages matching Regex

- [x] **Size Cost Calculation**
  - Compute the size of a package:
    - Both directly and through its dependencies.

- [x] **Ratings Fetching**
  - Fetch the ratings (metrics) for a package.

- [x] **Reset to Default**
  - Include an option to reset the system to its default state.

- [x] **Accessibility**
  - Should be accessible through a REST-ful API.
  - Should be accessible through an ADA-compliant web browser interface.

- [x] **User Registration, Authentication, and Deletion**
  - The system must support registering new users, authenticating them via username and secure password, and allowing users to delete their accounts.

- [x] **Permission-based Access Control**
  - Users must have distinct permissions for uploading, searching, and downloading packages.

- [x] **Token-based Authentication**
  - Upon successful login, the system should issue an authentication token. This token should remain valid for either 1000 API interactions or 10 hours.

- [x] **Administrator Roles**
  - The system must allow certain users to be assigned as administrators. Administrators are the only users who can register new users or delete accounts.

- [x] **User Groups**
  - Users should be able to belong to specific user groups.

- [ ] **Sensitive Package Download Restrictions**
  - The system must prevent unauthorized users from downloading sensitive or secret packages.
