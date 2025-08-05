const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const body = req.body;
    const custom = body.customData || {};

    // Grab from correct source:
    const inquirySource = (body['Inquiry Source'] || '').trim();

    // Debugging
    console.log('🔍 Inquiry Source from body:', inquirySource);
    console.log('CustomData Keys:', Object.keys(custom || {}));

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
    console.error('❌ Notion write error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
