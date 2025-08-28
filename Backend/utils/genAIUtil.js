const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getFootprintAnalysis = async (userData, category) => {
  if (!userData || !userData.inputs) {
    throw new Error("Invalid user data provided.");
  }

  const userDataString = JSON.stringify(userData.inputs, null, 2);
  let prompt = "";
  let systemMessage =
    "You are an expert carbon footprint calculator that responds only in valid JSON format.";

  switch (category) {
    case "energy":
      prompt = `
Analyze the following energy consumption data and calculate total carbon footprint in kg CO2e.
Use these emission factors:
- Electricity (India): 0.82 kg CO2e/kWh
- LPG: 2.98 kg CO2e/liter
- PNG: 2.03 kg CO2e/scm
- Petrol: 2.31 kg CO2e/liter
- Diesel: 2.68 kg CO2e/liter
- CNG: 2.75 kg CO2e/kg

Provide 3 actionable suggestions based on highest consumption.

User Data:
${userDataString}

        **Your Task:**
        1.  **Calculate:** Calculate the total carbon footprint in kilograms of CO2 equivalent (kg CO2e). Iterate through each item. Use these emission factors:
            - Electricity (India): 0.82 kg CO2e/kWh
            - LPG: 2.98 kg CO2e/liter
            - PNG: 2.03 kg CO2e/scm
            - Petrol: 2.31 kg CO2e/liter
            - Diesel: 2.68 kg CO2e/liter
            - CNG: 2.75 kg CO2e/kg
            - Firewood: 1.83 kg CO2e/kg
            - Charcoal: 2.68 kg CO2e/kg
            - Cow Dung: 0.75 kg CO2e/kg
            Sum all calculated values to get a final total.
        2.  **Suggest:** Based on the user's highest consumption, provide 3 personalized and actionable suggestions to reduce their footprint.
        3.  **Format Output:** Return your response ONLY as a valid JSON object. Do not include any other text or markdown formatting.

        **JSON Structure:**
        {
          "carbonFootprintKg": <number>,
          "suggestions": [
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" }
          ]
        }
      `;
      break;

    case "food":
      prompt = `
Analyze the following food consumption data and calculate total carbon footprint in kg CO2e.
Use these emission factors:
- Beef: 27.0 kg CO2e/kg
- Lamb: 39.0 kg CO2e/kg
- Chicken: 6.0 kg CO2e/kg
- Fish: 5.0 kg CO2e/kg
- Eggs: 4.0 kg CO2e/kg
- Cheese: 8.0 kg CO2e/kg
- Yogurt: 1.2 kg CO2e/kg
- Tofu: 2.0 kg CO2e/kg
- Paneer: 3.0 kg CO2e/kg

Provide 3 actionable suggestions based on highest consumption.

User Data:
${userDataString}

        **Your Task:**
        1.  **Calculate:** Calculate the total carbon footprint in kilograms of CO2 equivalent (kg CO2e). Use these emission factors for common ingredients (refer to "grocery.json" for full list if needed by model, but use these directly for prompt):            
            - Cheese: 8.0 kg CO2e/kg
            - Yogurt: 1.2 kg CO2e/kg
            - Tofu: 2.0 kg CO2e/kg
            - Paneer: 3.0 kg CO2e/kg
            - Roti: 0.4 kg CO2e/piece
            - Rice: 0.6 kg CO2e/bowl
            - Dal: 0.5 kg CO2e/bowl
            - Milk: 0.7 kg CO2e/glass
            - Vegetables: 0.4 kg CO2e/bowl
            - Oil: 0.3 kg CO2e/tbsp
            - Curd: 0.6 kg CO2e/bowl
            - Butter: 0.5 kg CO2e/tbsp
            - Cheese: 1.1 kg CO2e/slice
            - Chhole: 1.0 kg CO2e/bowl
            - Aloo Paratha: 1.2 kg CO2e/piece
            - Kadhi: 0.9 kg CO2e/bowl
            - Veg Pulao: 1.6 kg CO2e/plate
            - Maggi: 1.4 kg CO2e/packet
            - Chhole Bhature: 3.5  kg CO2e/plate
            - Idli Sambar: 2.0 kg CO2e/serving
            - Panner Tikka: 4.2 kg CO2e/plate
            - Veg Biryani: 3.0 kg CO2e/plate
            - Rajma Chawal: 2.8 kg CO2e/plate
            - Samosa: 0.6 kg CO2e/piece
            - Masala Dosa: 2.3 kg CO2e/piece
            - Pav Bhaji: 3.1 kg CO2e/plate
            - Kadhi Chawal: 2.4 kg CO2e/plate
            - Vegetable Sandwich: 1.8 kg CO2e/sandwich
            - Poha: 1.3 kg CO2e/serving
            - Upma: 1.5 kg CO2e/serving
            - Veg Momos: 0.28 kg CO2e/piece
            - Dhokla: 1.2 kg CO2e/plate
            - Chicken: 2.4 kg CO2e/g
            - Eggs: 0.9 kg CO2e/g
            - Fish: 3.0 kg CO2e/g
            - Mutton: 5.0 kg CO2e/g
            - Chicken Curry: 3.5 kg CO2e/plate
            - Egg Curry: 2.4 kg CO2e/plate
            - Fish Curry: 3.8 kg CO2e/ plate
            - Omelette: 1.0 kg CO2e/piece
            - Chicken Biryani: 4.2 kg CO2e/plate
            - Mutton Biryani: 5.5 kg CO2e/plate
            - Egg Biryani: 3.1 kg CO2e/plate
            - Egg Roll: 2.0 kg CO2e/piece
            - Chicken Roll: 2.8 kg CO2e/piece
            - Fish Fry: 3.2 kg CO2e/piece
            - Chicken Tikka: 3.7 kg CO2e/plate
            - Butter Chicken with Naan: 7.2 kg CO2e/plate
            - Fish Curry: 5.5 kg CO2e/serving
            - Egg Curry: 4.4 kg CO2e/plate
            - Chicken Biryani: 6.8 kg CO2e/plate
            - Mutton Rogan Josh: 8.5 kg CO2e/plate
            - Prawn Masala: 6.0 kg CO2e/plate
            - Fried Fish: 5.0 kg CO2e/plate
            - Grilled Chicken: 6.2 kg CO2e/portion
            - Chicken Shawarma: 4.9 kg CO2e/roll
            - Chicken Kebab: 4.6 kg CO2e/skewer
            - Tandoori Chicken: 6.5 kg CO2e/leg
            - Chicken Burger: 5.3 kg CO2e/piece
            - Fish Fry with Rice: 6.1 kg CO2e/plate
            - Mutton Korma: 9.0 kg CO2e/plate
            - Egg Bhurji: 3.7 kg CO2e/plate
            If user input refers to prepared dishes (e.g., "Chicken Biryani"), use the corresponding factors from "food_emission.json" if provided in a simplified form within the input.
        2.  **Suggest:** Based on the user's highest consumption, provide 3 personalized and actionable suggestions to reduce their footprint.
        3.  **Format Output:** Return your response ONLY as a valid JSON object.

        **JSON Structure:**
        {
          "carbonFootprintKg": <number>,
          "suggestions": [
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" }
          ]
        }
      `;
      break;

    case "shopping":
      prompt = `
Analyze the following shopping data and calculate total carbon footprint in kg CO2e.
Use these emission factors for electronics and clothing:
Electronics:
- Smartphone: 70 kg CO2e
- Laptop: 200 kg CO2e
- Television: 400 kg CO2e
- Washing Machine: 500 kg CO2e

Clothing per kg material:
- Cotton: 15.0 kg CO2e
- Polyester: 20.0 kg CO2e
- Denim: 30.0 kg CO2e

For items in USD spent:
- New electronics: 3.0 kg CO2e/USD
- New clothes: 4.0 kg CO2e/USD
- Second-hand items: 0.1 kg CO2e/USD

Provide 3 actionable suggestions based on highest consumption.

User Data:
${userDataString}

        **Your Task:**
        1.  **Calculate:** Calculate the total carbon footprint in kilograms of CO2 equivalent (kg CO2e).
            If user data includes specific electronic items (e.g., "smartphone", "laptop") or clothing items with material and quantity (e.g., {"item": "T-shirt", "material": "cotton", "quantity": 2}) or Grocery items with item type and quantity(e.g., {"item": "bread", "quantity": 2}), use the following precise factors:
            **Electronics (carbon_emission per item):**
            - Smartphone: 70 kg CO2e/0.2 kg
            - Laptop: 200 kg CO2e/1.5 kg
            - Tablet: 120 kg CO2e/0.5 kg
            - Television: 400 kg CO2e/10 kg
            - Smartwatch: 30 kg CO2e/0.05 kg
            - Headphones: 30 kg CO2e/0.25 kg
            - Camera: 110 kg CO2e/1.5 kg
            - Printer: 250 kg CO2e/6.5 kg
            - Gaming Console: 250 kg CO2e/4 kg
            - Wi-Fi Router: 50 kg CO2e/0.35 kg
            - Washing Machine: 500 kg CO2e/60 kg
            - Refrigerator: 600 kg CO2e/45 kg
            - Desktop Computer: 350 kg CO2e/8 kg
            - Air Conditioner (Window AC - 1 Ton): 500 kg CO2e/40 kg
            - Air Conditioner (Window AC - 1.5 Ton): 500 kg CO2e/40 kg
            - Air Conditioner (Split AC - 1 Ton): 600 kg CO2e/45 kg
            - Air Conditioner (Split AC - 1.5 Ton): 800 kg CO2e/55 kg
            - Air Conditioner (Inverter Split AC - 1.5 Ton): 750 kg CO2e/50 kg
            - Air Conditioner (Inverter Split AC - 2.0+ Ton): 1000 kg CO2e/90 kg
            **Clothing (emission factor per kg of material):**
            - Cotton: 15.0 kg CO2e/kg
            - Polyester: 20.0 kg CO2e/kg
            - Denim: 30.0 kg CO2e/kg
            - Wool: 25 kg CO2e/kg
            - Leather: 35 kg CO2e/kg
            - Nylon: 18 kg CO2e/kg
            - Acrylic: 22 kg CO2e/kg
            - Silk: 40 kg CO2e/kg
            - Linen: 12 kg CO2e/kg
            - Rayon: 16 kg CO2e/kg
            - Spandex: 14 kg CO2e/kg
            - Hemp: 10 kg CO2e/kg
            - Viscose: 19 kg CO2e/kg
            - Cashmere: 50 kg CO2e/kg
            **Grocery (emission factor per kg of material):**
            - Beef: 27 kg CO2e/kg
            - Pork: 12 kg CO2e/kg
            - Chicken: 6 kg CO2e/kg
            - Fish: 5 kg CO2e/ kg
            - Eggs: 4 kg CO2e/kg
            - Cheese: 8 kg CO2e/kg
            - Yogurt: 1.2 kg CO2e/kg
            - Bread: 1.5 kg CO2e/kg
            - Lamb: 39 kg CO2e/kg
            - Tofu: 2 kg CO2e/kg
            - Panner: 3 kg CO2e/kg
            - Rice: 2 kg CO2e/kg
            - Wheat: 2 kg CO2e/kg
            - Lentils: 1 kg CO2e/kg
            - Beans: 1.2 kg CO2e/kg
            - Nuts: 2.5 kg CO2e/kg
            - Chickpeas: 1 kg CO2e/kg
            - Oats: 1.5 kg CO2e/kg
            - Potatoes: 0.5 kg CO2e/kg
            - Tomatoes: 1.5 kg CO2e/kg
            - Carrots: 0.5 kg CO2e/kg
            - Onions: 0.5 kg CO2e/kg
            - Broccoli: 1 kg CO2e/kg
            - Spinach: 0.8 kg CO2e/kg
            - Cucumbers: 0.5 kg CO2e/kg
            - Peppers: 1 kg CO2e/kg
            - Apples: 0.5 kg CO2e/kg
            - Bananas: 0.3 kg CO2e/kg
            - Oranges: 0.4 kg CO2e/kg
            - Berries: 0.6 kg CO2e/kg
            - Grapes: 0.5 kg CO2e/kg
            - Pears: 0.4 kg CO2e/kg
            - Kiwis: 0.6 Kg CO2e/kg
            - Avocados: 0.8 kg CO2e/kg
            - Lemons: 0.3 kg CO2e/kg
            - Limes: 0.3 kg CO2e/kg
            - Peaches: 0.5 kg CO2e/kg
            - Plums: 0.4 kg CO2e/kg
            - Cherries: 0.6 kg CO2e/kg
            - Blackberries: 0.6 kg CO2e/kg
            - Strawberries: 0.5 kg CO2e/kg
            - Watermelon: 0.7 kg CO2e/kg
            - Vegetables: 0.5 kg CO2e/kg
            - Fruits: 0.5 kg CO2e/kg
            - Grains: 0.5 kg CO2e/kg
            - Legumes: 0.5 kg CO2e/kg
            - Nuts Seeds: 0.5 Kg CO2e/kg
            - Herbs Spices: 0.5 kg CO2e/kg
            - Sugar: 1 kg CO2e/kg
            - Salt: 0.1 kg CO2e/kg
            - Honey: 2 kg CO2e/kg
            - Chocolate: 10 kg CO2e/kg
            - Snacks: 2 kg CO2e/kg
            - Sauces: 1 kg CO2e/kg
            - Processed Foods: 3 kg CO2e/kg
            - milk: 1 kg CO2e/liter
            - Juice: 0.5 kg CO2e/liter
            - Soda: 0.3 kg CO2e/liter
            - Water: 0.1 CO2e/Liter
            - Beer: 2 kg CO2e/liter
            - Wine: 3 kg CO2e/Liter
            - Spirits: 4 kg CO2e/Liter
            - Soft Drinks: 1 kg CO2e/Liter
            - Juices: 1.2 kg CO2e/Liter
            - Alcohol: 2 kg CO2e/Liter
            - Coffee: 18 kg CO2e/Liter
            - Tea: 5 kg CO2e/Liter
            - Oils Fats: 0.5 kg CO2e/Liter
            - Bottled Water: 0.5 kg CO2e/Liter
            - Plant Based Milk: 1 kg CO2e/Liter
            - Nut Milk: 1.2 kg CO2e/Liter            
            (Also, refer to 'cloth.json' for item weights, e.g., T-shirt: 0.2kg, Jeans: 0.8kg).
            For other items or if the input is in terms of USD spent for broader categories, use these sample factors per USD spent:
            - New electronics (general): 3.0 kg CO2e/USD
            - New clothes (fast fashion, general): 4.0 kg CO2e/USD
            - Second-hand items: 0.1 kg CO2e/USD
        2.  **Suggest:** Based on the user's highest consumption, provide 3 personalized and actionable suggestions to reduce their footprint.
        3.  **Format Output:** Return your response ONLY as a valid JSON object.

        **JSON Structure:**
        {
          "carbonFootprintKg": <number>,
          "suggestions": [
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" }
          ]
        }
      `;
      break;

    case "transport":
      prompt = `
Analyze the following transport data and calculate total carbon footprint in kg CO2e.
Use these emission factors per km:
- Car (Petrol): 0.15 kg CO2e/km
- Bus (City): 0.08 kg CO2e/km
- Train (Electric): 0.03 kg CO2e/km
- Domestic Flight: 0.18 kg CO2e/km
- Intl Short-haul Flight: 0.16 kg CO2e/km
- Intl Long-haul Flight: 0.14 kg CO2e/km

Provide 3 actionable suggestions based on highest consumption.

User Data:
${userDataString}

        **Your Task:**
        1.  **Calculate:** Calculate the total carbon footprint in kilograms of CO2 equivalent (kg CO2e). Use these emission factors per kilometer:
            - Car (Petrol, e.g., Hatchback): 0.15 kg CO2e/km (or use specific car types like Sedan: 0.18, SUV: 0.25 if provided in input)
            - Bus (Public City): 0.08 kg CO2e/km
            - Train (Electric): 0.03 kg CO2e/km
            - Domestic Flight: 0.18 kg CO2e/km
            - International Short-haul Flight: 0.16 kg CO2e/km
            - International Long-haul Flight: 0.14 kg CO2e/km
            Select the most appropriate factor if multiple are available based on user input details.
        2.  **Suggest:** Based on the user's highest consumption, provide 3 personalized and actionable suggestions to reduce their footprint.
        3.  **Format Output:** Return your response ONLY as a valid JSON object.

        **JSON Structure:**
        {
          "carbonFootprintKg": <number>,
          "suggestions": [
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" },
            { "title": "<string>", "description": "<string>" }
          ]
        }
      `;
      break;

    default:
      throw new Error(`Invalid category: ${category}`);
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
    });

    const jsonString = chatCompletion.choices[0].message.content;

    // Extract JSON safely
    const match = jsonString.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in AI response");
    const aiResponse = JSON.parse(match[0]);

    return {
      carbonFootprintKg: aiResponse.carbonFootprintKg,
      suggestions: aiResponse.suggestions,
    };
  } catch (error) {
    console.error(`Error calling OpenAI API for ${category}:`, error);
    throw new Error("Failed to get analysis from Gen AI model.");
  }
};

