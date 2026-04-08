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

    請務必僅以 JSON 格式回傳結果，格式如下：
    {
      "summary": "對搜尋結果的簡短總結",
      "events": [
        {
          "title": "活動名稱",
          "date": "活動日期或期間",
          "location": "活動地點",
          "category": "活動類別",
          "description": "活動簡介",
          "link": "官方連結或售票連結"
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash-latest",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  try {
    let text = response.text || "{}";
    // 移除 markdown 代碼塊標籤 (如果有的話)
    text = text.replace(/```json\n?/, "").replace(/```/, "").trim();
    const data = JSON.parse(text);
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
