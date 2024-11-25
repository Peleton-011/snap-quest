import { Request, Response } from "express";

const promptSets = {
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

export default function GET(req: Request, res: Response) {
    const set = req.query.set as string || "default";
    const prompts = promptSets[set] || promptSets.default;
    res.json(prompts);
}
