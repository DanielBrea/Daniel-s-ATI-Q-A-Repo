const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // ✅ Add this to see what's being sent by GHL
    console.log('Webhook Payload:', req.body);

    const { name, source, inquiryType, inquiryText, adminNotes } = req.body;

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        'Name': {
          title: [{ type: 'text', text: { content: name || '' } }]
        },
        'Source': {
          select: { name: source || 'Other' }
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
