const { randomBytes } = require("crypto");
const prisma = require("../config/prisma");

const createCollection = async (req, res) => {
  const { title, readingMode, unlockDate } = req.body;

  if (!title || !readingMode)
    return res.status(400).json({ error: "Titre et mode de lecture requis" });

  if (readingMode === "SCHEDULED" && !unlockDate)
    return res.status(400).json({ error: "Date de lecture requise" });

  if (!["IMMEDIATE", "SCHEDULED"].includes(readingMode))
    return res.status(400).json({ error: "Mode de lecture invalide" });

  const publicToken = randomBytes(16).toString("hex");

  const collection = await prisma.collection.create({
    data: {
      userId: req.userId,
      title,
      publicToken,
      readingMode,
      unlockDate: readingMode === "SCHEDULED" ? new Date(unlockDate) : null,
      modeLocked: true,
    },
    include: { _count: { select: { letters: true } } },
  });

  res.status(201).json(collection);
};

const getMyCollections = async (req, res) => {
  const collections = await prisma.collection.findMany({
    where: { userId: req.userId },
    include: { _count: { select: { letters: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json(collections);
};

const deleteCollection = async (req, res) => {
  const { id } = req.params;

  const collection = await prisma.collection.findUnique({
    where: { id: Number(id) },
  });

  if (!collection || collection.userId !== req.userId)
    return res.status(404).json({ error: "Collection introuvable" });

  await prisma.letter.deleteMany({ where: { collectionId: Number(id) } });
  await prisma.collection.delete({ where: { id: Number(id) } });

  res.json({ message: "Collection supprimée" });
};

const getCollection = async (req, res) => {
  const { token } = req.params;

  const collection = await prisma.collection.findUnique({
    where: { publicToken: token },
    include: { _count: { select: { letters: true } } },
  });

  if (!collection || collection.userId !== req.userId)
    return res.status(404).json({ error: "Collection introuvable" });

  res.json(collection);
};

module.exports = { createCollection, getMyCollections, getCollection, deleteCollection };
