// __define-ocg__: API to update Google Sheet row status from frontend dropdown
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { rowIndex, status } = req.body;
  if (typeof rowIndex !== 'number' || !status) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    // Load credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = '1FrCJK0o2_Dbj_xqAB30CNGOpLeIYPzKtnsXezkwA7NE';
    const sheetName = 'Sheet1';
    const column = 'J'; // Misalnya kolom ke-26 (ubah jika kolom berbeda)

    const cell = `${sheetName}!${column}${rowIndex + 2}`; // +2 karena index 0 = header, dan Sheets mulai dari 1

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: cell,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[status]],
      },
    });

    return res.status(200).json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('Error updating Google Sheet:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
