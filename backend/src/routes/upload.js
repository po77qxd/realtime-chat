import express from "express";
import { upload } from "../middlewares/multer.js";
import auth from "../auth/auth.js";

const uploadRouter = express();

uploadRouter.post("/", auth, upload.single("image"), (req, res) => {
	const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
	res.json({
		url: imageUrl,
	});
});

export { uploadRouter };
