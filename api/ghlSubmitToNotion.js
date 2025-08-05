const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const payload = req.body;
    const custom = payload.customData || {};

    // Debug
    console.log('Payload Keys:', Object.keys(payload));
    console.log('CustomData Keys:', Object.keys(custom));

    // Find the value that looks like a dropdown
    const allDropdownKeys = Object.keys(custom).filter(key =>
      ['source', 'Source', 'inquiry source', 'Inquiry Source', 'How did you hear', 'platform'].some(x =>
        key.toLowerCase().includes(x.toLowerCase())
      )
    );

    const guessedSourceKey = allDropdownKeys[0]; // fallback to first match
    const inquirySource = (guessedSourceKey && custom[guessedSourceKey]) ? custom[guessedSourceKey].trim() : 'Other';

    console.log(`🔍 Guessed Source Key: [${guessedSourceKey}] → Value: [${inquirySource}]`);

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        'Name': {
          title: [{ type: 'text', text: { content: custom.Name || '' } }]
        },
        'Source': {
          select: { name: inquirySource || 'Other' }
        },
        'Inquiry Type': {
          select: { name: custom.inquiryType || 'Question (Tech Support)' }
        },
        'Inquiry Text': {
          rich_text: [{ type: 'text', text: { content: custom.inquiryText || '' } }]
        },
        'Admin Notes / Comments': {
          rich_text: [{ type: 'text', text: { content: custom.adminNotes || '' } }]
        },
        'Status': {
          select: { name: 'Needs Review' }
        }
      }
    });

    res.status(200).json({ success: true, id: response.id });
  } catch (err) {
    console.error('🚨 Notion write error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
