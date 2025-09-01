
import * as chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
  try {
    console.log('Chromium object:', chromium);
    if (!chromium) {
      throw new Error('Chromium is undefined after import');
    }

    const executablePath = await chromium.executablePath();

    if (!executablePath) {
      throw new Error('Chromium executable path is undefined');
    }

    res.status(200).json({ success: true, executablePath });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: error.message });
  }
}
