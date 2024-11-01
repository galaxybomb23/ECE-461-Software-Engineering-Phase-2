// want a util functoin that can get user permissions return a interface that have this also work with checking to see if the token is value
import { admin_create_account, login } from "../src/userManagement.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { getUserPermissions } from "./validatoin.ts";

const db = new DB("data/data.db");

await db.execute(
	`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            username TEXT NOT NULL UNIQUE, 
            hashed_password TEXT, 
            can_search BOOLEAN, 
            can_download BOOLEAN, 
            can_upload BOOLEAN, 
            user_group TEXT, 
            token_start_time INTEGER, 
            token_api_interactions INTEGER, 
            password_salt TEXT, 
            password_rounds INTEGER,
			is_admin BOOLEAN,
			token TEXT
        )`,
);

admin_create_account(
	db,
	"ece30861defaultadminuser",
	"correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;",
	true,
	true,
	true,
	"admin",
	true,
);
admin_create_account(db, "pi", "password", true, true, false, "users", false);

const { isAuthenticated, token} = login(db, "pi", "password")
if (isAuthenticated) {
    let new_token = token as string;
    console.log(getUserPermissions(db, new_token))
}
else {
    console.log("Uh-oh login failed")
}

