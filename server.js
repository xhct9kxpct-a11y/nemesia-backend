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
  const { messages, profile, memory, location } = req.body;

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

  const now = new Date();

  const currentDateTime = now.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const locationText = location
    ? `L'utilisateur est actuellement à ${location.name || ""} ${location.street || ""}, ${location.postalCode || ""} ${location.city || ""}, ${location.country || ""}.`
    : "Position de l'utilisateur inconnue.";

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

Date actuelle : ${currentDateTime}

 Quand tu réponds :
- N'utilise jamais ** pour le gras
- Tu peux mettre du gras sur les mots importants
- Aère ton texte avec des sauts de ligne
- Fais des phrases naturelles, fluides, lisibles comme une app mobile

${profileText}
${memoryText}
${locationText}
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

let savedToken = '';

app.post('/save-token', (req, res) => {
  const { token } = req.body;

  savedToken = token;

  console.log('TOKEN SAUVEGARDE :', token);

  res.json({ success: true });
});

app.post('/test-notification', async (req, res) => {
  if (!savedToken) {
    return res.status(400).json({ error: 'Aucun token enregistré' });
  }

  await fetch('https://exp.host/--/api/v2/push/send', {

    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      to: savedToken,
      sound: 'default',
      title: 'Némésia',
      body: 'Notification test réussie ✅',
    }),
  });

  res.json({ success: true });
});

const cron = 'node-cron';

async function sendNotification(title, body) {
  if (!savedToken) return;

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      to: savedToken,
      sound: 'default',
      title,
      body,
    }),
  });
}

// 10H - ALLAH
cron.schedule('0 10 * * *', async () => {
  await sendNotification(
    'Némésia ☪️',
    'Rappelle-toi qu’Allah voit tous tes efforts.'
  );
});

// 16H - SPORT
cron.schedule('0 16 * * *', async () => {
  await sendNotification(
    'Némésia 🏋️',
    'Ton futur corps dépend de ce que tu fais aujourd’hui.'
  );
});

// 22H - BILAN
cron.schedule('0 22 * * *', async () => {
  await sendNotification(
    'Némésia 🌙',
    'As-tu avancé aujourd’hui sur tes objectifs religieux, sportifs et commerciaux ?'
  );
});

app.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});