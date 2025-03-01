const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const query = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = req.body.query;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    res.status(200).json({ data: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to query the AI model' });
  }
};

module.exports = { query };
