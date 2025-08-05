const { Client } = require('@notionhq/client');
const axios = require('axios');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  try {
    const { id, gptResponse, finalResponse, newStatus } = req.body;

    // 🔍 Step 1: Retrieve Notion page to get Name + Source
    const page = await notion.pages.retrieve({ page_id: id });
    const name = page.properties.Name?.title[0]?.text?.content || '(No Name)';
    const source = page.properties.Source?.select?.name || '(No Source)';

    // ✅ Decide Status: use "Skipped" if finalResponse is "skip" (case-insensitive), otherwise default
    const statusValue =
      (finalResponse || '').trim().toLowerCase() === 'skip'
        ? 'Skipped'
        : 'Approved To Submit To Client';

    // 📝 Step 2: Update Notion properties
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
          select: { name: statusValue }
        }
      }
    });

    // 📣 Step 3: Post to Slack with full context
    try {
      const slackRes = await axios.post('https://hooks.slack.com/services/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', {
        text: `✅ *New Approved Response Submitted*\n👤 *Name:* ${name}\n💬 *Source:* ${source}\n🧠 *Response:* ${finalResponse}`
      });
      console.log('Slack posted:', slackRes.status, slackRes.data);
    } catch (slackError) {
      console.error('Slack notification failed:', slackError.message);
      if (slackError.response) {
        console.error('Slack response details:', slackError.response.status, slackError.response.data);
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Notion submission failed:', err.message);
    res.status(500).json({ error: err.message });
  }
};
