import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const privKey = process.env.PRIV_KEY;
  if (!token) {
    return res.status(401).json({
      message: "Aucun jeton d'authentification trouvé dans les cookies.",
    });
  }

  try {
    const decoded = jwt.verify(token, privKey);
    req.user_id = decoded.user_id;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Accès refusé, jeton invalide ou expiré.",
    });
  }
};

export default auth;