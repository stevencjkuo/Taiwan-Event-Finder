import { GoogleGenAI, Type } from "@google/genai";
import { EventData } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function searchEvents(params: {
  startDate?: string;
  endDate?: string;
  county?: string;
  category?: string;
  keyword?: string;
}): Promise<{ events: EventData[]; summary: string; sources: any[] }> {
  const { startDate, endDate, county, category, keyword } = params;
  
  const dateRange = startDate && endDate 
    ? `${startDate} 到 ${endDate}` 
    : (startDate || endDate || "不限");

  const prompt = `
    請搜尋台灣在 ${county || "各地"} 舉辦的活動或展覽。
    篩選條件：
    - 日期區間：${dateRange}
    - 類別：${category || "不限"}
    - 關鍵字：${keyword || "無"}

    請提供盡可能多的真實活動（最多 10 個），且必須在該日期區間內舉辦。
    請以繁體中文回答。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "對搜尋結果的簡短總結",
          },
          events: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "活動名稱" },
                date: { type: Type.STRING, description: "活動日期或期間" },
                location: { type: Type.STRING, description: "活動地點" },
                category: { type: Type.STRING, description: "活動類別" },
                description: { type: Type.STRING, description: "活動簡介" },
                link: { type: Type.STRING, description: "官方連結或售票連結" },
              },
              required: ["title", "date", "location", "category", "description"],
            },
          },
        },
        required: ["summary", "events"],
      },
    },
  });

  try {
    const data = JSON.parse(response.text || "{}");
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
      events: data.events || [],
      summary: data.summary || "找不到相關活動。",
      sources: sources,
    };
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return { events: [], summary: "搜尋出錯，請稍後再試。", sources: [] };
  }
}
