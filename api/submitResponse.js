const { Client } = require('@notionhq/client');
const axios = require('axios'); // ✅ NEW: Slack webhook support

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

    // ✅ NEW: Send Slack notification
    try {
      await axios.post('https://hooks.slack.com/services/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', {
        text: `✅ *New Approved Response Submitted*\n🧑‍💻 *Entry ID:* ${id}\n💬 *Response:* ${finalResponse}`
      });
    } catch (slackError) {
      console.error('Slack notification failed:', slackError.message);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
