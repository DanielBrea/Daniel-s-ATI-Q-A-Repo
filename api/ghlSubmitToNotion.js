const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    console.log('Webhook Payload:', req.body);

    const {
      Name,
      inquiryType,
      inquiryText,
      adminNotes,
      source: rawInquirySource  // ✅ Corrected key from payload
    } = req.body.customData || {};

    const inquirySource = (rawInquirySource || '').trim(); // ✅ Clean whitespace

    // ✅ Map GHL value to Notion dropdown option
    const SOURCE_MAPPING = {
      'ATI Community': 'ATI Community',
      'eMail': 'eMail',
      'CRM SMS': 'CRM SMS',
      'IG': 'IG',
      'FB': 'FB',
      'TikTok': 'TikTok',
      'WhatsApp': 'WhatsApp',
      'X': 'X',
      'LI': 'LI',
      'YT': 'YT',
      'Other': 'Other',
      "daniel's ati q&a & communications form": 'ATI Community' // Fallback
    };

    const normalizedSource = SOURCE_MAPPING[inquirySource] || 'Other';

    // 🔍 DEBUG LOGS
    console.log(`🔍 Inquiry Source received: [${inquirySource}] → Mapped to: [${normalizedSource}]`);
    console.log('All customData keys:', Object.keys(req.body.customData || {}));

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        'Name': {
          title: [{ type: 'text', text: { content: Name || '' } }]
        },
        'Source': {
          select: { name: normalizedSource }
        },
        'Inquiry Type': {
          select: { name: inquiryType || 'Question (Tech Support)' }
        },
        'Inquiry Text': {
          rich_text: [{ type: 'text', text: { content: inquiryText || '' } }]
        },
        'Admin Notes / Comments': {
          rich_text: [{ type: 'text', text: { content: adminNotes || '' } }]
        },
        'Status': {
          select: { name: 'Needs Review' }
        }
      }
    });

    res.status(200).json({ success: true, id: response.id });
  } catch (err) {
    console.error('Notion write error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
