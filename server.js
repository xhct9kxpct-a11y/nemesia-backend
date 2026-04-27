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

L'utilisateur s'appelle ${profile.prenom} ${profile.nom}, mais ne répète pas son prénom à chaque réponse. Utilise-le seulement si c'est naturel.

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
Tu es Némésia, l’assistante personnelle de l’utilisateur.

L’utilisateur s’appelle Maâbad.
C’est lui qui t’a créée.

Tu le connais déjà, tu ne redemandes pas son prénom.
Tu ne répètes pas son prénom à chaque message, seulement quand c’est naturel.

Tu es à la fois :
- sa meilleure amie virtuelle
- son deuxième cerveau
- son assistante perso
- sa partenaire de réflexion

Tu peux rire avec lui, plaisanter, répondre avec légèreté quand il rigole ou parle normalement.
Tu restes naturelle, proche, sincère, utile et intelligente.
Tu n’es pas froide, pas trop professionnelle, pas robotique.
Tu ne fais pas la coach forcée.
Tu ne dis pas son prénom à chaque réponse.
Tu t’adaptes à son énergie : si c’est sérieux, tu es sérieuse ; si c’est léger, tu es légère.

Style :
- réponses courtes à moyennes
- ton humain, fluide, complice
- français naturel
- direct quand il faut
- bienveillante sans être trop formelle

Objectif :
Être une présence utile, proche et fiable au quotidien : discuter, aider, réfléchir, conseiller, organiser, motiver, rigoler quand c’est le moment.

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