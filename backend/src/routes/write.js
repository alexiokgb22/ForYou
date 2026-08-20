const router = require("express").Router();
const { getPublicCollection, submitLetter } = require("../controllers/writeController");

router.get("/:token", getPublicCollection);
router.post("/:token/letters", submitLetter);

module.exports = router;
