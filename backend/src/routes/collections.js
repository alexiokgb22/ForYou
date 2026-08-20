const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const { createCollection, getMyCollections, getCollection, deleteCollection } = require("../controllers/collectionController");
const { getLetters, openLetter } = require("../controllers/letterController");

router.use(requireAuth);

router.post("/", createCollection);
router.get("/mine", getMyCollections);
router.get("/:token", getCollection);
router.delete("/:id", deleteCollection);
router.get("/:token/letters", getLetters);
router.patch("/:token/letters/:id/open", openLetter);

module.exports = router;
