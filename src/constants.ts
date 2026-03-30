export const TAIWAN_COUNTIES = [
  "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
  "基隆市", "新竹縣", "新竹市", "苗栗縣", "彰化縣", "南投縣",
  "雲林縣", "嘉義縣", "嘉義市", "屏東縣", "宜蘭縣", "花蓮縣",
  "台東縣", "澎湖縣", "金門縣", "連江縣"
];

export const ACTIVITY_CATEGORIES = [
  "全部", "運動", "文化", "藝術", "攝影", "音樂", "展覽", "市集", "親子", "科技", "美食", "旅遊"
];

export type EventData = {
  title: string;
  date: string;
  location: string;
  category: string;
  description: string;
  link?: string;
  imageUrl?: string;
};
