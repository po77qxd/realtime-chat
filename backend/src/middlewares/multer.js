import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./src/uploads/");
	},
	// Nom du fichier: timestamp + random + extension originale
	filename: (req, file, cb) => {
		const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, uniqueName + path.extname(file.originalname));
	},
});

// upload middleware
const upload = multer({
	storage: storage,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
	fileFilter: (req, file, cb) => {
		const fileTypes = /jpeg|jpg|png|gif|webp/;
		const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
		const mimeType = fileTypes.test(file.mimetype);

		if (extname && mimeType) {
			return cb(null, true);
		}
		cb(new Error("Seulement les fichiers JPEG, JPG, PNG, GIF sont autorisés"));
	},
});

export { upload };
