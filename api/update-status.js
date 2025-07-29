import { google } from "googleapis";
import fs from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { row, col, value } = req.body;
    const sheetId = "1FrCJK0o2_Dbj_xqAB30CNGOpLeIYPzKtnsXezkwA7NE"; // ID Google Sheet kamu

    const serviceAccount = JSON.parse(fs.readFileSync("service-account.json", "utf8"));

    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth: jwtClient });

    const range = `Sheet1!${col}${row}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[value]] },
    });

    res.status(200).json({ success: true, message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
