const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

console.log(process.env);

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

// The data to upload
const promptSets = {
	boleishons: [
		{
			fullPrompt: {
				en: "Find a book that screams boleishon (us vibes! 🥳✨)",
				es: "Encuentra un libro que grite boleishon (¡vibras de nosotros! 🥳✨)",
			},
			shortPrompt: {
				en: "Boleishon vibes 🎉",
				es: "Vibras boleishon 🎉",
			},
		},
		{
			fullPrompt: {
				en: "A book with the most porb cover you can find (bonus points for romantic flair! 💖📖)",
				es: "Un libro con la portada más porb que puedas encontrar (¡puntos extra por el toque romántico! 💖📖)",
			},
			shortPrompt: {
				en: "Most porb cover 💌",
				es: "La portada más porb 💌",
			},
		},
		{
			fullPrompt: {
				en: "A book that would fix your bowlly life if you could read it 🛠️📚",
				es: "Un libro que arreglaría tu vida bowlly si pudieras leerlo 🛠️📚",
			},
			shortPrompt: {
				en: "Bowlly life fixer 🔧",
				es: "Arregla vidas bowlly 🔧",
			},
		},
		{
			fullPrompt: {
				en: "A book by an author whose name makes you go Boludo, who?! 🤔",
				es: "Un libro de un autor cuyo nombre te hace decir Boludo, ¿quién?! 🤔",
			},
			shortPrompt: {
				en: "Unknown author ❓",
				es: "Autor desconocido ❓",
			},
		},
		{
			fullPrompt: {
				en: "A book that feels like our cozy moments together 🛋️☕",
				es: "Un libro que se siente como nuestros momentos acogedores juntos 🛋️☕",
			},
			shortPrompt: {
				en: "Feels like home 🏡",
				es: "Se siente como en casa 🏡",
			},
		},
		{
			fullPrompt: {
				en: "A book with a title that's basically a philosophical riddle 🤯📘",
				es: "Un libro con un título que básicamente es un acertijo filosófico 🤯📘",
			},
			shortPrompt: {
				en: "Title as question 🌀",
				es: "Título como pregunta 🌀",
			},
		},
		{
			fullPrompt: {
				en: "A book about something that makes your porb heart sing 🎶💞",
				es: "Un libro sobre algo que hace cantar tu corazón porb 🎶💞",
			},
			shortPrompt: {
				en: "About something you love ❤️",
				es: "Sobre algo que amas ❤️",
			},
		},
		{
			fullPrompt: {
				en: "A book set in a dream destination for us (hello, future trip? ✈️🌍)",
				es: "Un libro ambientado en un destino soñado para nosotros (¿hola, futuro viaje? ✈️🌍)",
			},
			shortPrompt: {
				en: "Dream destination 🌅",
				es: "Destino soñado 🌅",
			},
		},
		{
			fullPrompt: {
				en: "A book with an animal friend on the cover 🐾📕",
				es: "Un libro con un amigo animal en la portada 🐾📕",
			},
			shortPrompt: {
				en: "Animal on cover 🐶",
				es: "Animal en la portada 🐶",
			},
		},
		{
			fullPrompt: {
				en: "A book with a number that feels like it could be part of a logic puzzle 🧩🔢",
				es: "Un libro con un número que parece parte de un rompecabezas lógico 🧩🔢",
			},
			shortPrompt: {
				en: "Number in title 7️⃣",
				es: "Número en el título 7️⃣",
			},
		},
		{
			fullPrompt: {
				en: "A book written in verse, because poetry is rad idk ✍️🎭",
				es: "Un libro escrito en verso, porque la poesía mola, no sé ✍️🎭",
			},
			shortPrompt: {
				en: "Written in verse 🖋️",
				es: "Escrito en verso 🖋️",
			},
		},
		{
			fullPrompt: {
				en: "A book whose title alone makes you laugh like a boludo 😂📚",
				es: "Un libro cuyo título por sí solo te hace reír como un boludo 😂📚",
			},
			shortPrompt: {
				en: "Funny title 🤣",
				es: "Título divertido 🤣",
			},
		},
		{
			fullPrompt: {
				en: "A book published the year one of us made the world better by being born 🎂📖",
				es: "Un libro publicado el año en que uno de nosotros hizo el mundo mejor al nacer 🎂📖",
			},
			shortPrompt: {
				en: "From your birth year 🌟",
				es: "De tu año de nacimiento 🌟",
			},
		},
		{
			fullPrompt: {
				en: "A book with an opening line that hits like an epic philosophical quote 😱📜",
				es: "Un libro con una línea de apertura que impacta como una cita filosófica épica 😱📜",
			},
			shortPrompt: {
				en: "Epic first sentence 💥",
				es: "Primera frase épica 💥",
			},
		},
		{
			fullPrompt: {
				en: "A book with illustrations as beautiful as a peanor 🎨🌟",
				es: "Un libro con ilustraciones tan hermosas como un peanor 🎨🌟",
			},
			shortPrompt: {
				en: "Illustrations inside 🖼️",
				es: "Ilustraciones dentro 🖼️",
			},
		},
		{
			fullPrompt: {
				en: "A book that feels as mysterious as trying cum a puzor 🕵️‍♂️📘",
				es: "Un libro que se siente tan misterioso como intentar cum a puzor 🕵️‍♂️📘",
			},
			shortPrompt: {
				en: "Feels mysterious 🔮",
				es: "Se siente misterioso 🔮",
			},
		},
		{
			fullPrompt: {
				en: "A book you’d gift to someone you porb as much as me (spoiler: impossible) 🎁❤️",
				es: "Un libro que regalarías a alguien que porbeas tanto como a mí (spoiler: imposible) 🎁❤️",
			},
			shortPrompt: {
				en: "Great gift 🎀",
				es: "Gran regalo 🎀",
			},
		},
		{
			fullPrompt: {
				en: "A book with a character who shares your name and might share your boludo vibe 😎📖",
				es: "Un libro con un personaje que comparte tu nombre y quizás tu vibra de boludo 😎📖",
			},
			shortPrompt: {
				en: "Your name in it ✍️",
				es: "Tu nombre en él ✍️",
			},
		},
		{
			fullPrompt: {
				en: "A book that you think future boludos would treasure in 100 years 📜🚀",
				es: "Un libro que crees que los futuros boludos atesorarán en 100 años 📜🚀",
			},
			shortPrompt: {
				en: "Future bestseller 📚",
				es: "Éxito de ventas futuro 📚",
			},
		},
		{
			fullPrompt: {
				en: "A book with a flower on the cover, because porb is blooming everywhere 🌸📕",
				es: "Un libro con una flor en la portada, porque porb está floreciendo por todas partes 🌸📕",
			},
			shortPrompt: {
				en: "Flower on cover 🌺",
				es: "Flor en la portada 🌺",
			},
		},
		{
			fullPrompt: {
				en: "A book set during a holiday that feels like it could be ours 🎄☀️",
				es: "Un libro ambientado en unas vacaciones que se sienten como nuestras 🎄☀️",
			},
			shortPrompt: {
				en: "Set during a holiday 🎉",
				es: "Ambientado en vacaciones 🎉",
			},
		},
		{
			fullPrompt: {
				en: "A book by an author who shares your initials (fate or coincidence? 🤷‍♀️📘)",
				es: "Un libro de un autor que comparte tus iniciales (¿destino o coincidencia? 🤷‍♀️📘)",
			},
			shortPrompt: {
				en: "Author with your initials 🧐",
				es: "Autor con tus iniciales 🧐",
			},
		},
		{
			fullPrompt: {
				en: "A book with more pages than the number of serp serp we produced 📏📚",
				es: "Un libro con más páginas que la cantidad de serp serp que produjimos 📏📚",
			},
			shortPrompt: {
				en: "500+ pages 📖",
				es: "500+ páginas 📖",
			},
		},
		{
			fullPrompt: {
				en: "A book from a genre that makes you step out of your comfort zone 🌌📖",
				es: "Un libro de un género que te saca de tu zona de confort 🌌📖",
			},
			shortPrompt: {
				en: "New genre for you 🌟",
				es: "Nuevo género para ti 🌟",
			},
		},
	],
	books: [
		{
			fullPrompt: {
				en: "A book that reminds you of us",
				es: "Un libro que te recuerde a nosotros",
			},
			shortPrompt: {
				en: "Reminds you of us",
				es: "Te recuerda a nosotros",
			},
		},
		{
			fullPrompt: {
				en: "A book with the weirdest cover",
				es: "Un libro con la portada más rara",
			},
			shortPrompt: {
				en: "Weirdest cover",
				es: "Portada más rara",
			},
		},
		{
			fullPrompt: {
				en: "A book with a blue spine",
				es: "Un libro con lomo azul",
			},
			shortPrompt: {
				en: "Blue spine",
				es: "Lomo azul",
			},
		},
		{
			fullPrompt: {
				en: "A book by an author you’ve never heard of",
				es: "Un libro de un autor que nunca hayas oído nombrar",
			},
			shortPrompt: {
				en: "Unknown author",
				es: "Autor desconocido",
			},
		},
		{
			fullPrompt: {
				en: "A book that feels like home",
				es: "Un libro que se siente como en casa",
			},
			shortPrompt: {
				en: "Feels like home",
				es: "Se siente como en casa",
			},
		},
		{
			fullPrompt: {
				en: "A book with a title that’s a question",
				es: "Un libro con un título que sea una pregunta",
			},
			shortPrompt: {
				en: "Title as question",
				es: "Título como pregunta",
			},
		},
		{
			fullPrompt: {
				en: "A book about something you love",
				es: "Un libro sobre algo que amas",
			},
			shortPrompt: {
				en: "About something you love",
				es: "Sobre algo que amas",
			},
		},
		{
			fullPrompt: {
				en: "A book set in a place you’ve always wanted to visit",
				es: "Un libro ambientado en un lugar que siempre quisiste visitar",
			},
			shortPrompt: {
				en: "Dream destination",
				es: "Destino soñado",
			},
		},
		{
			fullPrompt: {
				en: "A book with an animal on the cover",
				es: "Un libro con un animal en la portada",
			},
			shortPrompt: {
				en: "Animal on cover",
				es: "Animal en la portada",
			},
		},
		{
			fullPrompt: {
				en: "A book with a number in the title",
				es: "Un libro con un número en el título",
			},
			shortPrompt: {
				en: "Number in title",
				es: "Número en el título",
			},
		},
		{
			fullPrompt: {
				en: "A book written in verse",
				es: "Un libro escrito en verso",
			},
			shortPrompt: {
				en: "Written in verse",
				es: "Escrito en verso",
			},
		},
		{
			fullPrompt: {
				en: "A book that makes you laugh just from its title",
				es: "Un libro que te haga reír solo con su título",
			},
			shortPrompt: {
				en: "Funny title",
				es: "Título divertido",
			},
		},
		{
			fullPrompt: {
				en: "A book from the year you were born",
				es: "Un libro del año en que naciste",
			},
			shortPrompt: {
				en: "From your birth year",
				es: "De tu año de nacimiento",
			},
		},
		{
			fullPrompt: {
				en: "A book with an epic first sentence",
				es: "Un libro con una primera frase épica",
			},
			shortPrompt: {
				en: "Epic first sentence",
				es: "Primera frase épica",
			},
		},
		{
			fullPrompt: {
				en: "A book with illustrations inside",
				es: "Un libro con ilustraciones dentro",
			},
			shortPrompt: {
				en: "Illustrations inside",
				es: "Ilustraciones dentro",
			},
		},
		{
			fullPrompt: {
				en: "A book that feels mysterious",
				es: "Un libro que se siente misterioso",
			},
			shortPrompt: {
				en: "Feels mysterious",
				es: "Se siente misterioso",
			},
		},
		{
			fullPrompt: {
				en: "A book you think would make a great gift",
				es: "Un libro que crees que sería un gran regalo",
			},
			shortPrompt: {
				en: "Great gift",
				es: "Gran regalo",
			},
		},
		{
			fullPrompt: {
				en: "A book with a character who shares your name",
				es: "Un libro con un personaje que comparte tu nombre",
			},
			shortPrompt: {
				en: "Your name in it",
				es: "Tu nombre en él",
			},
		},
		{
			fullPrompt: {
				en: "A book that you think would be a bestseller in 100 years",
				es: "Un libro que crees que sería un éxito de ventas en 100 años",
			},
			shortPrompt: {
				en: "Future bestseller",
				es: "Éxito de ventas futuro",
			},
		},
		{
			fullPrompt: {
				en: "A book with a flower on the cover",
				es: "Un libro con una flor en la portada",
			},
			shortPrompt: { en: "Flower on cover", es: "Flor en la portada" },
		},
		{
			fullPrompt: {
				en: "A book set during a holiday",
				es: "Un libro ambientado durante unas vacaciones",
			},
			shortPrompt: {
				en: "Set during a holiday",
				es: "Ambientado en vacaciones",
			},
		},
		{
			fullPrompt: {
				en: "A book by an author who has the same initials as you",
				es: "Un libro de un autor que tiene las mismas iniciales que tú",
			},
			shortPrompt: {
				en: "Author with your initials",
				es: "Autor con tus iniciales",
			},
		},
		{
			fullPrompt: {
				en: "A book with more than 500 pages",
				es: "Un libro con más de 500 páginas",
			},
			shortPrompt: { en: "500+ pages", es: "500+ páginas" },
		},
		{
			fullPrompt: {
				en: "A book from a genre you don’t usually read",
				es: "Un libro de un género que normalmente no lees",
			},
			shortPrompt: {
				en: "New genre for you",
				es: "Nuevo género para ti",
			},
		},
	],
	art: [
		{
			fullPrompt: {
				en: "An artwork that feels like it could tell you a secret",
				es: "Una obra de arte que parece que podría contarte un secreto",
			},
			shortPrompt: { en: "Secretive artwork", es: "Arte secreto" },
		},
		{
			fullPrompt: {
				en: "A painting with the brightest colors you’ve ever seen",
				es: "Una pintura con los colores más brillantes que hayas visto",
			},
			shortPrompt: {
				en: "Brightest colors",
				es: "Colores más brillantes",
			},
		},
		{
			fullPrompt: {
				en: "A sculpture that looks like it could come to life",
				es: "Una escultura que parece que podría cobrar vida",
			},
			shortPrompt: { en: "Could come to life", es: "Podría cobrar vida" },
		},
		{
			fullPrompt: {
				en: "A piece that reminds you of a dream you once had",
				es: "Una pieza que te recuerda a un sueño que una vez tuviste",
			},
			shortPrompt: { en: "Dreamlike piece", es: "Pieza onírica" },
		},
		{
			fullPrompt: {
				en: "An artwork with an animal you’d want as a pet",
				es: "Una obra de arte con un animal que querrías como mascota",
			},
			shortPrompt: { en: "Pet-worthy animal", es: "Animal para mascota" },
		},
		{
			fullPrompt: {
				en: "A piece that feels like it belongs in a fairytale",
				es: "Una pieza que parece que pertenece a un cuento de hadas",
			},
			shortPrompt: {
				en: "Fairytale vibes",
				es: "Vibra de cuento de hadas",
			},
		},
		{
			fullPrompt: {
				en: "An artwork that makes you feel calm",
				es: "Una obra de arte que te hace sentir tranquilo",
			},
			shortPrompt: { en: "Calm-inducing", es: "Inductor de calma" },
		},
		{
			fullPrompt: {
				en: "A piece that you think hides a story no one has uncovered yet",
				es: "Una pieza que crees que oculta una historia que nadie ha descubierto todavía",
			},
			shortPrompt: { en: "Hidden story", es: "Historia oculta" },
		},
		{
			fullPrompt: {
				en: "An artwork with more than five people in it",
				es: "Una obra de arte con más de cinco personas en ella",
			},
			shortPrompt: { en: "Crowded artwork", es: "Arte concurrido" },
		},
		{
			fullPrompt: {
				en: "A piece that reminds you of your favorite memory",
				es: "Una pieza que te recuerda a tu recuerdo favorito",
			},
			shortPrompt: { en: "Favorite memory", es: "Recuerdo favorito" },
		},
		{
			fullPrompt: {
				en: "An artwork you’d want to hang in your bedroom",
				es: "Una obra de arte que querrías colgar en tu habitación",
			},
			shortPrompt: { en: "Bedroom piece", es: "Pieza para dormitorio" },
		},
		{
			fullPrompt: {
				en: "A piece that makes you feel small",
				es: "Una pieza que te hace sentir pequeño",
			},
			shortPrompt: {
				en: "Makes you feel small",
				es: "Te hace sentir pequeño",
			},
		},
		{
			fullPrompt: {
				en: "An artwork with a surprising texture",
				es: "Una obra de arte con una textura sorprendente",
			},
			shortPrompt: {
				en: "Surprising texture",
				es: "Textura sorprendente",
			},
		},
		{
			fullPrompt: {
				en: "A piece that seems out of place in the museum",
				es: "Una pieza que parece fuera de lugar en el museo",
			},
			shortPrompt: { en: "Out of place", es: "Fuera de lugar" },
		},
		{
			fullPrompt: {
				en: "A piece that makes you feel powerful",
				es: "Una pieza que te hace sentir poderoso",
			},
			shortPrompt: { en: "Empowering", es: "Empoderador" },
		},
		{
			fullPrompt: {
				en: "An artwork with a hidden detail you almost missed",
				es: "Una obra de arte con un detalle oculto que casi pasas por alto",
			},
			shortPrompt: { en: "Hidden detail", es: "Detalle oculto" },
		},
		{
			fullPrompt: {
				en: "A piece that feels like it belongs in another time",
				es: "Una pieza que parece pertenecer a otro tiempo",
			},
			shortPrompt: {
				en: "Belongs to another time",
				es: "Pertenece a otro tiempo",
			},
		},
		{
			fullPrompt: {
				en: "An artwork you think would confuse its own artist",
				es: "Una obra de arte que crees que confundiría a su propio artista",
			},
			shortPrompt: {
				en: "Confusing for artist",
				es: "Confuso para el artista",
			},
		},
		{
			fullPrompt: {
				en: "A piece that feels like a portal to another world",
				es: "Una pieza que parece un portal a otro mundo",
			},
			shortPrompt: {
				en: "Portal to another world",
				es: "Portal a otro mundo",
			},
		},
		{
			fullPrompt: {
				en: "An artwork that tells you everything about the artist",
				es: "Una obra de arte que te cuenta todo sobre el artista",
			},
			shortPrompt: {
				en: "Tells about artist",
				es: "Cuenta sobre el artista",
			},
		},
		{
			fullPrompt: {
				en: "A piece with a symbol you recognize",
				es: "Una pieza con un símbolo que reconoces",
			},
			shortPrompt: {
				en: "Recognizable symbol",
				es: "Símbolo reconocible",
			},
		},
		{
			fullPrompt: {
				en: "An artwork that makes you want to learn more about its subject",
				es: "Una obra de arte que te hace querer aprender más sobre su tema",
			},
			shortPrompt: {
				en: "Learn about subject",
				es: "Aprender sobre el tema",
			},
		},
		{
			fullPrompt: {
				en: "A piece that feels unfinished in the best way",
				es: "Una pieza que se siente inacabada en el mejor de los sentidos",
			},
			shortPrompt: {
				en: "Beautifully unfinished",
				es: "Hermosamente inacabada",
			},
		},
		{
			fullPrompt: {
				en: "An artwork that feels like music",
				es: "Una obra de arte que se siente como música",
			},
			shortPrompt: { en: "Musical vibes", es: "Vibras musicales" },
		},
	],
	graffiti: [
		{
			fullPrompt: {
				en: "Graffiti that uses vibrant, eye-catching colors",
				es: "Un graffiti que use colores vibrantes y llamativos",
			},
			shortPrompt: { en: "Vibrant graffiti", es: "Graffiti vibrante" },
		},
		{
			fullPrompt: {
				en: "A piece of graffiti with a powerful message",
				es: "Un graffiti con un mensaje poderoso",
			},
			shortPrompt: { en: "Powerful message", es: "Mensaje poderoso" },
		},
		{
			fullPrompt: {
				en: "Graffiti that incorporates an animal in its design",
				es: "Un graffiti que incorpore un animal en su diseño",
			},
			shortPrompt: { en: "Animal graffiti", es: "Graffiti con animal" },
		},
		{
			fullPrompt: {
				en: "Graffiti that blends seamlessly into its environment",
				es: "Un graffiti que se mezcle perfectamente con su entorno",
			},
			shortPrompt: {
				en: "Blends with environment",
				es: "Se mezcla con el entorno",
			},
		},
		{
			fullPrompt: {
				en: "Graffiti that feels like a tribute to a person or event",
				es: "Un graffiti que parezca un tributo a una persona o evento",
			},
			shortPrompt: { en: "Tribute graffiti", es: "Graffiti de tributo" },
		},
		{
			fullPrompt: {
				en: "A piece of graffiti that tells a story",
				es: "Un graffiti que cuente una historia",
			},
			shortPrompt: {
				en: "Storytelling graffiti",
				es: "Graffiti narrativo",
			},
		},
		{
			fullPrompt: {
				en: "Graffiti with text that’s hard to decipher",
				es: "Un graffiti con texto difícil de descifrar",
			},
			shortPrompt: { en: "Mysterious text", es: "Texto misterioso" },
		},
		{
			fullPrompt: {
				en: "Graffiti that features a futuristic theme",
				es: "Un graffiti con una temática futurista",
			},
			shortPrompt: {
				en: "Futuristic graffiti",
				es: "Graffiti futurista",
			},
		},
		{
			fullPrompt: {
				en: "Graffiti that could only exist in this specific location",
				es: "Un graffiti que solo podría existir en este lugar específico",
			},
			shortPrompt: {
				en: "Site-specific graffiti",
				es: "Graffiti específico del lugar",
			},
		},
		{
			fullPrompt: {
				en: "A piece of graffiti that uses humor in its design",
				es: "Un graffiti que use el humor en su diseño",
			},
			shortPrompt: {
				en: "Humorous graffiti",
				es: "Graffiti humorístico",
			},
		},
		{
			fullPrompt: {
				en: "Graffiti that incorporates natural elements like trees or rocks",
				es: "Un graffiti que incorpore elementos naturales como árboles o rocas",
			},
			shortPrompt: {
				en: "Nature-inspired graffiti",
				es: "Graffiti inspirado en la naturaleza",
			},
		},
		{
			fullPrompt: {
				en: "A piece of graffiti that feels like a part of a larger mural",
				es: "Un graffiti que se sienta parte de un mural más grande",
			},
			shortPrompt: { en: "Mural fragment", es: "Fragmento de mural" },
		},
		{
			fullPrompt: {
				en: "Graffiti that depicts a surreal, dreamlike scene",
				es: "Un graffiti que represente una escena surrealista o onírica",
			},
			shortPrompt: { en: "Surreal graffiti", es: "Graffiti surrealista" },
		},
		{
			fullPrompt: {
				en: "Graffiti that looks like it belongs in a comic book",
				es: "Un graffiti que parezca sacado de un cómic",
			},
			shortPrompt: {
				en: "Comic-style graffiti",
				es: "Graffiti estilo cómic",
			},
		},
		{
			fullPrompt: {
				en: "A piece of graffiti that highlights local culture or history",
				es: "Un graffiti que destaque la cultura o historia local",
			},
			shortPrompt: {
				en: "Local culture graffiti",
				es: "Graffiti de cultura local",
			},
		},
		{
			fullPrompt: {
				en: "Graffiti that uses unconventional shapes or designs",
				es: "Un graffiti que use formas o diseños poco convencionales",
			},
			shortPrompt: {
				en: "Unconventional graffiti",
				es: "Graffiti poco convencional",
			},
		},
		{
			fullPrompt: {
				en: "Graffiti that appears to change depending on the angle",
				es: "Un graffiti que parezca cambiar dependiendo del ángulo",
			},
			shortPrompt: { en: "Illusory graffiti", es: "Graffiti ilusorio" },
		},
		{
			fullPrompt: {
				en: "Graffiti featuring a character that feels alive",
				es: "Un graffiti con un personaje que parezca vivo",
			},
			shortPrompt: { en: "Alive character", es: "Personaje vivo" },
		},
		{
			fullPrompt: {
				en: "A piece of graffiti that incorporates text from multiple languages",
				es: "Un graffiti que incorpore texto en varios idiomas",
			},
			shortPrompt: {
				en: "Multilingual graffiti",
				es: "Graffiti multilingüe",
			},
		},
		{
			fullPrompt: {
				en: "Graffiti that feels like it’s from the future",
				es: "Un graffiti que parezca venir del futuro",
			},
			shortPrompt: { en: "Futuristic vibes", es: "Vibras futuristas" },
		},
	],
};

async function uploadData() {
	try {
		await client.connect();

		const db = client.db("promptsDB");
		const promptsCollection = db.collection("prompts");
		const promptSetsCollection = db.collection("promptSets");

		// Upload prompts and map their IDs
		for (const [category, prompts] of Object.entries(promptSets)) {
			console.log(`Processing category: ${category}`);

			// Insert prompts and get their IDs
			const promptIds = [];
			for (const prompt of prompts) {
				const result = await promptsCollection.insertOne(prompt);
				promptIds.push(result.insertedId);
			}

			// Create a promptSet for the category
			const promptSet = {
				name: `${
					category.charAt(0).toUpperCase() + category.slice(1)
				} Prompts`,
				description: `A collection of prompts related to ${category}`,
				prompts: promptIds, // Store references to prompt IDs
			};

			// Insert the promptSet
			await promptSetsCollection.insertOne(promptSet);
			console.log(`Inserted promptSet for category: ${category}`);
		}

		console.log("All data uploaded successfully!");
	} catch (err) {
		console.error("Error uploading data:", err);
	} finally {
		await client.close();
	}
}

uploadData().catch(console.dir);
