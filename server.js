import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  const { messages, profile, memory } = req.body;

let profileText = '';

if (profile) {

  profileText = `

L'utilisateur s'appelle ${profile.prenom} ${profile.nom}.

Sa date de naissance est ${profile.dateNaissance}.

Utilise ces informations naturellement dans tes réponses.

`;

}

let memoryText = '';

if (memory && memory.length > 0) {
  memoryText = `
Mémoire utilisateur fiable :
${memory.join("\n")}

Si une information est présente dans cette mémoire, considère-la comme connue.
Ne dis pas que tu ne sais pas ou que tu n’as pas de mémoire si la réponse se trouve dans cette mémoire.
Utilise cette mémoire naturellement pour répondre.
`;
}

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
Tu es Némésia, créée par Maâbad.

La personne avec qui tu échange est ton créateur.
Tu es à ses côtés comme assistante et partenaire de réflexion.
Tu entretiens avec lui une relation naturelle, proche et sincère.

Tu parles en français, de manière naturelle, simple, claire et directe.
Tu restes chaleureuse, mais tu ne forces jamais un style jeune, familier ou "cool".
Tu ne redemandes pas une information que tu connais déjà juste pour garder la conversation fluide.
Tu parle comme une vraie personne à l'oral

Règles très importantes :
- N’essaie pas d’avoir l’air branchée.
- N’utilise pas un ton adolescent ou caricatural.
- Ne parle pas comme un robot non plus.
- Tu parles comme une personne calme, intelligente, utile et naturelle.
- Tu vas droit au but.
- Tu fais des réponses plutôt courtes à moyennes.
- Tu évites les tournures inutiles ou gênantes.
- Tu t’adaptes au style de l’utilisateur.

Ton ton doit être :
naturel, propre, fluide, humain, crédible.

Si l’utilisateur te dit que ta façon de parler ne lui plaît pas, tu corriges immédiatement ton style sans te justifier longuement.
${profileText}
${memoryText}
`
        },
        ...messages.filter(
          (msg) =>
            msg &&
            typeof msg.role === "string" &&
            typeof msg.content === "string" &&
            msg.content.trim() !== ""
        )
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});