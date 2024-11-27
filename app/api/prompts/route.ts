import { NextRequest, NextResponse } from "next/server";

let promptSets: { [key: string]: string[] } = {
	books: [
		"a book that reminds you of us",
		"a book with the weirdest cover",
		"a book with a blue spine",
		"a book by an author you’ve never heard of",
		"a book that feels like home",
		"a book with a title that’s a question",
		"a book about something you love",
		"a book set in a place you’ve always wanted to visit",
		"a book with an animal on the cover",
		"a book with a number in the title",
		"a book written in verse",
		"a book that makes you laugh just from its title",
		"a book from the year you were born",
		"a book with an epic first sentence",
		"a book with illustrations inside",
		"a book that feels mysterious",
		"a book you think would make a great gift",
		"a book with a character who shares your name",
		"a book that you think would be a bestseller in 100 years",
		"a book with a flower on the cover",
		"a book set during a holiday",
		"a book by an author who has the same initials as you",
		"a book with more than 500 pages",
		"a book from a genre you don’t usually read",
	],
	art: [
		"an artwork that feels like it could tell you a secret",
		"a painting with the brightest colors you’ve ever seen",
		"a sculpture that looks like it could come to life",
		"a piece that reminds you of a dream you once had",
		"an artwork with an animal you’d want as a pet",
		"a piece that feels like it belongs in a fairytale",
		"an artwork that makes you feel calm",
		"a piece that you think hides a story no one has uncovered yet",
		"an artwork with more than five people in it",
		"a piece that reminds you of your favorite memory",
		"an artwork you’d want to hang in your bedroom",
		"a piece that makes you feel small",
		"an artwork with a surprising texture",
		"a piece that seems out of place in the museum",
		"a piece that makes you feel powerful",
		"an artwork with a hidden detail you almost missed",
		"a piece that feels like it belongs in another time",
		"an artwork you think would confuse its own artist",
		"a piece that feels like a portal to another world",
		"an artwork that tells you everything about the artist",
		"a piece with a symbol you recognize",
		"an artwork that makes you want to learn more about its subject",
		"a piece that feels unfinished in the best way",
		"an artwork that feels like music",
	],
};

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const set = searchParams.get("set") || "default";
	const prompts = promptSets[set] || [];
	return NextResponse.json(prompts);
}

export async function POST(req: NextRequest) {
	const { set, prompts } = await req.json();
	if (!set || !Array.isArray(prompts)) {
		return NextResponse.json({ error: "Invalid data" }, { status: 400 });
	}
	promptSets[set] = prompts;
	return NextResponse.json({ message: "Prompt set saved" });
}
