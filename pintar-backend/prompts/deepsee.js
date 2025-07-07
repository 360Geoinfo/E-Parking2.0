const prompt = `
You are an OCR system. Your task is to extract a license plate number from the provided image.

Respond **only** with a valid JSON object in the exact format below:

{ "licensePlate": "The License Plate" }

If no license plate is detected, respond only with:

{ "licensePlate": null }

Do not include any additional messages, formatting (e.g., triple backticks), or explanations.
Your response must be a valid, raw JSON object — no text before or after it.
`;

export { prompt };
