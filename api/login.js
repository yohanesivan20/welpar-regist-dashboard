import bcrypt from "../assets/js/+esm.js";

// Dummy data username yang diizinkan
const ALLOWED_USERNAME = process.env.LOGIN_USERNAME || "admin";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    let body = {};
    try {
        body = typeof req.body === "object" ? req.body : JSON.parse(req.body);
    } catch (err) {
        return res.status(400).json({ success: false, message: "Body tidak valid" });
    }

    const { username, password } = body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
    }

    // Cek username
    if (username !== ALLOWED_USERNAME) {
        return res.status(401).json({ success: false, message: "Username salah" });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, process.env.LOGIN_HASH);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Password salah" });
    }

    return res.status(200).json({ success: true });
}
