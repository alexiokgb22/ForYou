const prisma = require("../config/prisma");

const getLetters = async (req, res) => {
  const { token } = req.params;

  const collection = await prisma.collection.findUnique({
    where: { publicToken: token },
  });

  if (!collection || collection.userId !== req.userId)
    return res.status(404).json({ error: "Collection introuvable" });

  const now = new Date();
  const canOpen =
    collection.readingMode === "IMMEDIATE" ||
    (collection.readingMode === "SCHEDULED" &&
      collection.unlockDate &&
      now >= new Date(collection.unlockDate));

  const letters = await prisma.letter.findMany({
    where: { collectionId: collection.id },
    orderBy: { sentAt: "desc" },
    select: {
      id: true,
      senderName: true,
      theme: true,
      status: true,
      sentAt: true,
    },
  });

  res.json({ canOpen, letters });
};

const openLetter = async (req, res) => {
  const { token, id } = req.params;

  const collection = await prisma.collection.findUnique({
    where: { publicToken: token },
  });

  if (!collection || collection.userId !== req.userId)
    return res.status(404).json({ error: "Collection introuvable" });

  const now = new Date();
  const canOpen =
    collection.readingMode === "IMMEDIATE" ||
    (collection.readingMode === "SCHEDULED" &&
      collection.unlockDate &&
      now >= new Date(collection.unlockDate));

  if (!canOpen)
    return res.status(403).json({ error: "Lettres encore verrouillées" });

  const letter = await prisma.letter.findUnique({
    where: { id: Number(id) },
  });

  if (!letter || letter.collectionId !== collection.id)
    return res.status(404).json({ error: "Lettre introuvable" });

  const updated = await prisma.letter.update({
    where: { id: Number(id) },
    data: {
      status: "OPENED",
      openedAt: letter.openedAt ?? now,
    },
  });

  res.json(updated);
};

module.exports = { getLetters, openLetter };
