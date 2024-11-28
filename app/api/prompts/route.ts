import { NextRequest, NextResponse } from "next/server";

interface Prompt {
	fullPrompt: string;
	shortPrompt: string;
}

let promptSets: { [key: string]: Prompt[] } = {
    books: [
        { "fullPrompt": "A book that reminds you of us", "shortPrompt": "Reminds you of us" },
        { "fullPrompt": "A book with the weirdest cover", "shortPrompt": "Weirdest cover" },
        { "fullPrompt": "A book with a blue spine", "shortPrompt": "Blue spine" },
        { "fullPrompt": "A book by an author you’ve never heard of", "shortPrompt": "Unknown author" },
        { "fullPrompt": "A book that feels like home", "shortPrompt": "Feels like home" },
        { "fullPrompt": "A book with a title that’s a question", "shortPrompt": "Title as question" },
        { "fullPrompt": "A book about something you love", "shortPrompt": "About something you love" },
        { "fullPrompt": "A book set in a place you’ve always wanted to visit", "shortPrompt": "Dream destination" },
        { "fullPrompt": "A book with an animal on the cover", "shortPrompt": "Animal on cover" },
        { "fullPrompt": "A book with a number in the title", "shortPrompt": "Number in title" },
        { "fullPrompt": "A book written in verse", "shortPrompt": "Written in verse" },
        { "fullPrompt": "A book that makes you laugh just from its title", "shortPrompt": "Funny title" },
        { "fullPrompt": "A book from the year you were born", "shortPrompt": "From your birth year" },
        { "fullPrompt": "A book with an epic first sentence", "shortPrompt": "Epic first sentence" },
        { "fullPrompt": "A book with illustrations inside", "shortPrompt": "Illustrations inside" },
        { "fullPrompt": "A book that feels mysterious", "shortPrompt": "Feels mysterious" },
        { "fullPrompt": "A book you think would make a great gift", "shortPrompt": "Great gift" },
        { "fullPrompt": "A book with a character who shares your name", "shortPrompt": "Your name in it" },
        { "fullPrompt": "A book that you think would be a bestseller in 100 years", "shortPrompt": "Future bestseller" },
        { "fullPrompt": "A book with a flower on the cover", "shortPrompt": "Flower on cover" },
        { "fullPrompt": "A book set during a holiday", "shortPrompt": "Set during a holiday" },
        { "fullPrompt": "A book by an author who has the same initials as you", "shortPrompt": "Author with your initials" },
        { "fullPrompt": "A book with more than 500 pages", "shortPrompt": "500+ pages" },
        { "fullPrompt": "A book from a genre you don’t usually read", "shortPrompt": "New genre for you" }
      ],
      art: [
        { "fullPrompt": "An artwork that feels like it could tell you a secret", "shortPrompt": "Secretive artwork" },
        { "fullPrompt": "A painting with the brightest colors you’ve ever seen", "shortPrompt": "Brightest colors" },
        { "fullPrompt": "A sculpture that looks like it could come to life", "shortPrompt": "Could come to life" },
        { "fullPrompt": "A piece that reminds you of a dream you once had", "shortPrompt": "Dreamlike piece" },
        { "fullPrompt": "An artwork with an animal you’d want as a pet", "shortPrompt": "Pet-worthy animal" },
        { "fullPrompt": "A piece that feels like it belongs in a fairytale", "shortPrompt": "Fairytale vibes" },
        { "fullPrompt": "An artwork that makes you feel calm", "shortPrompt": "Calm-inducing" },
        { "fullPrompt": "A piece that you think hides a story no one has uncovered yet", "shortPrompt": "Hidden story" },
        { "fullPrompt": "An artwork with more than five people in it", "shortPrompt": "Crowded artwork" },
        { "fullPrompt": "A piece that reminds you of your favorite memory", "shortPrompt": "Favorite memory" },
        { "fullPrompt": "An artwork you’d want to hang in your bedroom", "shortPrompt": "Bedroom piece" },
        { "fullPrompt": "A piece that makes you feel small", "shortPrompt": "Makes you feel small" },
        { "fullPrompt": "An artwork with a surprising texture", "shortPrompt": "Surprising texture" },
        { "fullPrompt": "A piece that seems out of place in the museum", "shortPrompt": "Out of place" },
        { "fullPrompt": "A piece that makes you feel powerful", "shortPrompt": "Empowering" },
        { "fullPrompt": "An artwork with a hidden detail you almost missed", "shortPrompt": "Hidden detail" },
        { "fullPrompt": "A piece that feels like it belongs in another time", "shortPrompt": "Belongs to another time" },
        { "fullPrompt": "An artwork you think would confuse its own artist", "shortPrompt": "Confusing for artist" },
        { "fullPrompt": "A piece that feels like a portal to another world", "shortPrompt": "Portal to another world" },
        { "fullPrompt": "An artwork that tells you everything about the artist", "shortPrompt": "Tells about artist" },
        { "fullPrompt": "A piece with a symbol you recognize", "shortPrompt": "Recognizable symbol" },
        { "fullPrompt": "An artwork that makes you want to learn more about its subject", "shortPrompt": "Learn about subject" },
        { "fullPrompt": "A piece that feels unfinished in the best way", "shortPrompt": "Beautifully unfinished" },
        { "fullPrompt": "An artwork that feels like music", "shortPrompt": "Musical vibes" }
      ]
      
      
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
