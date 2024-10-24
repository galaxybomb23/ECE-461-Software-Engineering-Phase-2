import sqlite3


# "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, hashed-password TEXT, can_search BOOLEAN, can_download BOOL
# EAN, can_upload BOOLEAN, user_group TEXT, token_start_time int, token_api_interactions INTEGER, password_salt TEXT, password_rounds INTEGER)"
# export interface PackageRating {
#   BusFactor: number;
#   Correctness: number;
#   RampUp: number;
#   ResponsiveMaintainer: number;
#   LicenseScore: number;
#   GoodPinningPractice: number;
#   PullRequest: number;
#   NetScore: number;
# }
conn = sqlite3.connect('data.db')
cursor = conn.cursor()

cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, hashed_password TEXT, can_search BOOLEAN, can_download BOOLEAN, can_upload BOOLEAN, user_group TEXT, token_start_time int, token_api_interactions INTEGER, password_salt TEXT, password_rounds INTEGER)")
cursor.execute("CREATE TABLE IF NOT EXISTS packages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, url TEXT NOT NULL, version TEXT, license_score INTEGER, netscore INTEGER, dependency_pinning_score INTEGER, rampup_score INTEGER, review_percentage_score INTEGER, bus_factor INTEGER, correctness INTEGER, responsive_maintainer INTEGER)")
conn.commit()
conn.close()