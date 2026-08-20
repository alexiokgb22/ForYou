const prisma = require("../config/prisma");

const getPublicCollection = async (req, res) => {
  const { token } = req.params;

  const collection = await prisma.collection.findUnique({
    where: { publicToken: token },
    select: {
      title: true,
      readingMode: true,
      unlockDate: true,
      user: { select: { name: true } },
    },
  });

  if (!collection)
    return res.status(404).json({ error: "Collection introuvable" });

  res.json(collection);
};

const submitLetter = async (req, res) => {
  const { token } = req.params;
  const { senderName, senderEmail, content, theme, designConfig } = req.body;

  if (!senderName || !content)
    return res.status(400).json({ error: "Prénom et contenu requis" });

  const collection = await prisma.collection.findUnique({
    where: { publicToken: token },
  });

  if (!collection)
    return res.status(404).json({ error: "Collection introuvable" });

  const letter = await prisma.letter.create({
    data: {
      collectionId: collection.id,
      senderName,
      senderEmail: senderEmail || null,
      content,
      theme: theme || "default",
      designConfig: designConfig || null,
    },
  });

  res.status(201).json(letter);
};

module.exports = { getPublicCollection, submitLetter };
