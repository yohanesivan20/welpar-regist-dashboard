import bcrypt from "../assets/js/+esm.js";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    let body = {};
    try {
        body = typeof req.body === "object" ? req.body : JSON.parse(req.body);
    } catch (err) {
        return res.status(400).json({ success: false, message: "Body tidak valid" });
    }

    const { password } = body;

    const isMatch = await bcrypt.compare(password, process.env.LOGIN_HASH);

    if (isMatch) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Password salah" });
    }
}