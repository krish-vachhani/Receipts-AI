import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractReceiptData(imageUrl: string) {
  const prompt = `
You are an expert receipt data extraction system. Analyze the provided receipt image and extract structured information with high accuracy.

EXTRACTION REQUIREMENTS:
Extract these fields precisely:
- Date: Format as DD/MM/YYYY (convert from any format found)
- Currency: 3-letter ISO code (INR, USD, EUR, etc.)
- Vendor/Store Name: The business name exactly as shown
- Individual Items: List each purchased item with name and cost
- Tax Amount: Total tax/GST amount only (exclude service charges)
- Total Amount: Final amount paid

CRITICAL OUTPUT RULES:
1. Return ONLY valid JSON - no markdown, no explanations, no code blocks
2. Use exact field names as specified in the schema below
3. Convert all monetary values to numbers (remove currency symbols)
4. If any field cannot be determined, use null
5. Ensure JSON is valid and parseable by JSON.parse()

REQUIRED JSON SCHEMA:
{
  "date": "DD/MM/YYYY",
  "currency": "INR",
  "vendor_name": "Store Name",
  "receipt_items": [
    {
      "item_name": "Product Name",
      "item_cost": 99.99
    }
  ],
  "tax": 18.00,
  "total": 117.99
}

VALIDATION CHECKLIST:
- All monetary values are numbers (no strings like "₹100")
- Date follows DD/MM/YYYY format exactly
- Currency is uppercase ISO code
- Items array contains objects with exact field names
- JSON structure matches schema precisely
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a receipt data extraction expert. Return only valid JSON with exact field names.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_tokens: 2000,
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  try {
    const text = response.choices[0].message.content || "{}";
    const parsed = JSON.parse(text);

    if (
      !parsed.date ||
      !parsed.vendor_name ||
      !Array.isArray(parsed.receipt_items)
    ) {
      throw new Error("Missing required fields in extracted data");
    }

    return parsed;
  } catch (error: any) {
    console.error("Receipt extraction failed:", error);
    throw new Error(`Failed to parse receipt data: ${error.message}`);
  }
}
