const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  try {
    const { title, type, source, draftContent, status } = req.body;

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_VAULT_DATABASE_ID },
      properties: {
        'Name': {
          title: [{ type: 'text', text: { content: title } }]
        },
        'Type': {
          select: { name: type }
        },
        'Source': {
          select: { name: source }
        },
        'Draft Content': {
          rich_text: [{ type: 'text', text: { content: draftContent } }]
        },
        'Status': {
          select: { name: status }
        },
        'Date Added': {
          date: { start: new Date().toISOString() }
        }
      }
    });

    res.status(200).json({ success: true, id: response.id });
  } catch (error) {
    res.status(500).json({
      message: "Notion API error",
      error: {
        status: error.status,
        code: error.code,
        body: error.body
      }
    });
  }
};