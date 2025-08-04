const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  try {
    const dbId = process.env.NOTION_DATABASE_ID;
    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: 'Status',
        select: { equals: 'Needs Review' }
      },
      page_size: 1
    });

    if (response.results.length === 0) {
      return res.status(200).json({ message: 'No entries needing review.' });
    }

    const entry = response.results[0];
    const props = entry.properties;

    res.status(200).json({
      id: entry.id,
      name: props.Name?.title[0]?.text?.content || '',
      source: props.Source?.select?.name || '',
      inquiryType: props['Inquiry Type']?.select?.name || '',
      inquiryText: props['Inquiry Text']?.rich_text[0]?.text?.content || ''
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};