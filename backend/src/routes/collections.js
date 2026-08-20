const router = require("express").Router();
const requireAuth = require("../middleware/requireAuth");
const { createCollection, getMyCollections, getCollection, deleteCollection } = require("../controllers/collectionController");

router.use(requireAuth);

router.post("/", createCollection);
router.get("/mine", getMyCollections);
router.get("/:token", getCollection);
router.delete("/:id", deleteCollection);

module.exports = router;
