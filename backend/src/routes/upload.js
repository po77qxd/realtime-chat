import express from "express";
import { upload } from "../middlewares/multer.js";

const uploadRouter = express();

uploadRouter.post("/", upload.single("image"), (req, res) => {
	const imageUrl = `localhost:3000/uploads/${req.file.filename}`;

	res.json({
		url: imageUrl,
	});
});

export { uploadRouter };
