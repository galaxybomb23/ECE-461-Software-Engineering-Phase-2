// want a util functoin that can get user permissions return a interface that have this also work with checking to see if the token is value
import { admin_create_account } from "../src/userManagement.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("data/data.db");

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
admin_create_account(db, "rushil", "password", true, true, false, "", false);
