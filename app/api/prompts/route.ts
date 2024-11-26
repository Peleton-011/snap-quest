import { NextRequest, NextResponse } from "next/server";

const promptSets: { [key: string]: string[] } = {
  default: [
    "Find a book with a title that describes us",
    "A book with the weirdest cover",
    "A book you think I’d love",
  ],
  bookstore: [
    "Find a cookbook",
    "A book with a red cover",
    "A book published before 2000",
  ],
};

export async function GET(req: NextRequest) {
  // Parse query parameters from the request URL
  const { searchParams } = new URL(req.url);
  const set = searchParams.get("set") || "default";

  // Retrieve the appropriate prompts set
  const prompts = promptSets[set as keyof typeof promptSets] || promptSets.default;

  // Return the response using NextResponse
  return NextResponse.json(prompts);
}
