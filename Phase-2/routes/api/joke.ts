import { FreshContext } from "$fresh/server.ts";
import { logger } from "~/src/logFile.ts";

// Jokes courtesy of https://punsandoneliners.com/randomness/programmer-jokes/
const JOKES = [
	"Why do Java developers often wear glasses? They can't C#.",
	"A SQL query walks into a bar, goes up to two tables and says “can I join you?”",
	"Wasn't hard to crack Forrest Gump's password. 1forrest1.",
	"I love pressing the F5 key. It's refreshing.",
	"Called IT support and a chap from Australia came to fix my network connection.  I asked “Do you come from a LAN down under?”",
	"There are 10 types of people in the world. Those who understand binary and those who don't.",
	"Why are assembly programmers often wet? They work below C level.",
	"My favourite computer based band is the Black IPs.",
	"What programme do you use to predict the music tastes of former US presidential candidates? An Al Gore Rhythm.",
	"An SEO expert walked into a bar, pub, inn, tavern, hostelry, public house.",
];

/**
 * Handles an incoming request and returns a random joke from the JOKES array.
 *
 * @param _req - The incoming request object.
 * @param _ctx - The context object provided by the Fresh framework.
 * @returns A Response object containing a random joke.
 */
export const handler = (_req: Request, _ctx: FreshContext): Response => {
	logger.info("--> /api/joke: GET");
	logger.silly("We got a jokster on our hands 🤡");
	const randomIndex = Math.floor(Math.random() * JOKES.length);
	const body = JOKES[randomIndex];
	return new Response(body);
};
