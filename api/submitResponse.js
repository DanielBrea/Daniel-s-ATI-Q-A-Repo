const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  try {
    const { id, gptResponse, finalResponse, newStatus } = req.body;

    await notion.pages.update({
      page_id: id,
      properties: {
        'GPT Response Suggestion': {
          rich_text: [{ type: 'text', text: { content: gptResponse || '' } }]
        },
        'Final Response': {
          rich_text: [{ type: 'text', text: { content: finalResponse || '' } }]
        },
        'Status': {
          select: { name: newStatus || 'Approved To Submit To Client' }
        }
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};