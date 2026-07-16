import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI Features will use fallback simulation mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // AI Analytics endpoint using Gemini
  app.post("/api/ai/analyze", async (req: express.Request, res: express.Response) => {
    try {
      const { type, data } = req.body;
      const ai = getAiClient();

      if (!ai) {
        // Fallback simulated AI responses if API key is missing
        return res.json({
          success: true,
          simulated: true,
          analysis: getFallbackSimulation(type, data)
        });
      }

      let systemPrompt = "You are the head business analyst and Michelin-star consultant for 'ครัวกะเพรา' (Kaprao POS Enterprise), a leading Thai holy basil restaurant brand.";
      let userPrompt = "";

      switch (type) {
        case "profit-cost":
          userPrompt = `Perform a food cost and profit margin analysis on these menu items:
${JSON.stringify(data)}
Analyze the percentage of Food Cost vs selling price, identify low-margin items, and give 3 highly actionable recommendations to optimize costs (e.g. portion control, supplier renegotiation, bundle promotions). Format your response as a neat JSON with fields:
- "summary": string
- "itemAnalysis": list of { "name": string, "foodCostPercent": number, "profitMargin": number, "status": "Good"|"Warning"|"Critical" }
- "recommendations": list of strings
Keep descriptions concise in Thai language.`;
          break;

        case "sales-forecast":
          userPrompt = `Generate a 7-day sales and demand forecast based on this historical data:
${JSON.stringify(data)}
Calculate expected revenue, orders, and specify weather/seasonal/time factors. Predict which basil menus will sell most on weekday vs weekend. Format as JSON with:
- "forecastSummary": string
- "predictedSales": list of { "day": string, "expectedRevenue": number, "predictedOrders": number, "confidence": string }
- "peakBasilTrend": string (Thai)
Format all details in Thai.`;
          break;

        case "purchase-recommendation":
          userPrompt = `Suggest optimal raw material purchase orders based on current inventory, recipes, and sales trends:
${JSON.stringify(data)}
Warn about critical shortages (e.g., holy basil, pork, eggs, chili) and suggest precise restock kilograms/units with estimated costs. Format as JSON with:
- "urgency": "High" | "Medium" | "Low"
- "criticalShortages": list of { "ingredient": string, "currentStock": string, "suggestedPurchase": string, "estimatedCost": number }
- "supplierAdvice": string
In Thai language.`;
          break;

        case "promo-generator":
          userPrompt = `Create 3 highly attractive promotional packages automatically designed to lift revenue during slow hours or clear soon-to-expire ingredients:
${JSON.stringify(data)}
Ensure calculated prices represent valid margins. Format as JSON with:
- "promoSummary": string
- "promotions": list of { "title": string, "description": string, "discountRate": string, "targetGroup": string }
In Thai language.`;
          break;

        default:
          userPrompt = `Provide a general operational summary and smart tips for this restaurant POS:
${JSON.stringify(data)}
Provide response in JSON with:
- "tips": list of strings
In Thai language.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText.trim());
      res.json({
        success: true,
        simulated: false,
        analysis: parsed
      });

    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        simulated: true,
        analysis: getFallbackSimulation(req.body.type, req.body.data)
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Fallback logic for offline/non-API demo
function getFallbackSimulation(type: string, data: any) {
  switch (type) {
    case "profit-cost":
      return {
        summary: "จากการวิเคราะห์ต้นทุน พบว่าเมนูกะเพราเนื้อโคขุนมีสัดส่วน Food Cost สูงสุด (42.5%) ควรปรับราคาขายหรือเจรจาแหล่งซื้อเนื้อเพื่อเพิ่มกำไรขั้นต้น",
        itemAnalysis: [
          { name: "กะเพราหมูสับไข่ดาว", foodCostPercent: 28.5, profitMargin: 71.5, status: "Good" },
          { name: "กะเพราเนื้อโคขุนพรีเมียม", foodCostPercent: 42.5, profitMargin: 57.5, status: "Critical" },
          { name: "กะเพราทะเลรวมมิตร", foodCostPercent: 35.0, profitMargin: 65.0, status: "Warning" },
          { name: "กะเพราไก่สับพริกแห้ง", foodCostPercent: 24.0, profitMargin: 76.0, status: "Good" }
        ],
        recommendations: [
          "แนะนำการทำ Portion Control สำหรับใบกะเพราพริกแห้งและพริกจินดาเพื่อลดขยะอาหารลงอีก 15%",
          "สร้างเซ็ตเมนู 'คู่หูสุดคุ้ม' กะเพราหมูสับ + น้ำเก๊กฮวย เพื่อดึงดูดลูกค้าและเพิ่มอัตรากำไร",
          "จัดซื้อเนื้อสัตว์แบบ Lot ใหญ่รายสัปดาห์จากผู้จัดส่งหลัก (Supplier A) เพื่อลดต้นทุนลงอีก 8%"
        ]
      };
    case "sales-forecast":
      return {
        forecastSummary: "แนวโน้มยอดขายคาดว่าจะเติบโตขึ้น 12% ในช่วงปลายสัปดาห์เนื่องจากวันหยุดยาวและสภาพอากาศแจ่มใส",
        predictedSales: [
          { day: "วันจันทร์", expectedRevenue: 8500, predictedOrders: 82, confidence: "สูง" },
          { day: "วันอังคาร", expectedRevenue: 9200, predictedOrders: 88, confidence: "สูง" },
          { day: "วันพุธ", expectedRevenue: 8900, predictedOrders: 85, confidence: "ปานกลาง" },
          { day: "วันพฤหัสบดี", expectedRevenue: 10400, predictedOrders: 98, confidence: "สูง" },
          { day: "วันศุกร์", expectedRevenue: 14500, predictedOrders: 135, confidence: "สูง" },
          { day: "วันเสาร์", expectedRevenue: 16800, predictedOrders: 155, confidence: "สูง" },
          { day: "วันอาทิตย์", expectedRevenue: 15200, predictedOrders: 140, confidence: "สูง" }
        ],
        peakBasilTrend: "เมนูกะเพราเนื้อพริกแห้งไข่ดาวเยิ้ม จะเป็นที่ต้องการสูงสุดในวันศุกร์และเสาร์ช่วงเวลา 18.00 - 20.00 น. ควรเตรียมวัตถุดิบเนื้อสับเพิ่มอีก 25%"
      };
    case "purchase-recommendation":
      return {
        urgency: "High",
        criticalShortages: [
          { ingredient: "ใบกะเพราเกษตรออร์แกนิก", currentStock: "1.2 กก.", suggestedPurchase: "5.0 กก.", estimatedCost: 350 },
          { ingredient: "เนื้อหมูบดอนามัย", currentStock: "3.5 กก.", suggestedPurchase: "15.0 กก.", estimatedCost: 2400 },
          { ingredient: "ไข่ไก่เบอร์ 2", currentStock: "45 ฟอง", suggestedPurchase: "4 แผง (120 ฟอง)", estimatedCost: 480 },
          { ingredient: "พริกแห้งจินดา", currentStock: "0.5 กก.", suggestedPurchase: "2.0 กก.", estimatedCost: 320 }
        ],
        supplierAdvice: "แนะนำสั่งซื้อด่วนจาก Supplier 'ฟาร์มผักกะเพราทอง' และ 'เขียงหมูเจ๊วรรณ' เพื่อให้ทันการรับเข้าล็อตเช้าพรุ่งนี้ เวลา 07.00 น. และรักษาความสดใหม่"
      };
    case "promo-generator":
      return {
        promoSummary: "โปรโมชั่นกระตุ้นยอดขายช่วงเวลาว่าง (Happy Hour: 14.00 - 16.00 น.) เพื่อเคลียร์สต๊อกไข่ไก่และหมูสับสด",
        promotions: [
          { title: "เซ็ตกะเพราสู้บ่าย", description: "กะเพราหมูสับพริกจินดา + ไข่ดาว 2 ฟอง + น้ำอัดลมเยือกแข็งพิเศษ", discountRate: "ลด 20%", targetGroup: "พนักงานออฟฟิศและนักศึกษาช่วงบ่าย" },
          { title: "คอมโบดาร์กเบซิล", description: "กะเพราไก่สับพริกแห้งโบราณ 2 จาน แถมฟรีนักเก็ตไก่และน้ำเก๊กฮวย", discountRate: "ราคาพิเศษ 189.-", targetGroup: "กลุ่มเพื่อนและครอบครัวขนาดเล็ก" },
          { title: "ดับเบิ้ลไข่ดาวเยิ้ม", description: "สั่งเมนูกะเพราจานเดี่ยวใดๆ แลกซื้อไข่ดาวลาวาฟองที่สองเพียง 5 บาท", discountRate: "แลกซื้อคุ้มค่า", targetGroup: "คนรักกะเพราเน้นโปรตีนจัดเต็ม" }
        ]
      };
    default:
      return {
        tips: [
          "รักษามาตรฐานความร้อนของกระทะในการผัดกะเพราพริกแห้งเพื่อให้ได้กลิ่นกระทะไหม้ที่เป็นเอกลักษณ์",
          "แนะนำเพิ่มเมนูกะเพราหมูกรอบหน้าร้านเพราะเป็นเมนูที่ทำกำไรต่อจานสูงสุด",
          "บันทึกยอด Stock Card ทุกครั้งเมื่อรับเข้าและเบิกออกเพื่อความแม่นยำของระบบคำนวณ Food Cost"
        ]
      };
  }
}

startServer();
