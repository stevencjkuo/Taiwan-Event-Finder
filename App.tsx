import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Tag, Loader2, ExternalLink, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TAIWAN_COUNTIES, ACTIVITY_CATEGORIES, type EventData } from './constants';
import { searchEvents } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [county, setCounty] = useState<string>('');
  const [category, setCategory] = useState<string>('全部');
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ events: EventData[]; summary: string; sources: any[] } | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const data = await searchEvents({
        startDate,
        endDate,
        county,
        category: category === '全部' ? undefined : category,
        keyword
      });
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Search className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">台灣活動搜尋趣</h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-emerald-600 transition-colors">最新活動</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">熱門展覽</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">關於我們</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> 開始日期
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-sm"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> 結束日期
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-sm"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> 縣市
              </label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-sm appearance-none"
              >
                <option value="">全台灣</option>
                {TAIWAN_COUNTIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> 類別
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-sm appearance-none"
              >
                {ACTIVITY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Keyword */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> 關鍵字
              </label>
              <input
                type="text"
                placeholder="搜尋活動名稱..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-sm"
              />
            </div>

            {/* Submit */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "開始搜尋"}
              </button>
            </div>
          </form>
        </section>

        {/* Results Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              搜尋結果
              {results && <span className="text-sm font-normal text-gray-400">({results.events.length} 個活動)</span>}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                  <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600 w-6 h-6" />
                </div>
                <p className="text-gray-500 font-medium animate-pulse">正在為您搜尋台灣各地的精彩活動...</p>
              </motion.div>
            ) : results ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Summary Card */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start">
                  <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800 leading-relaxed">{results.summary}</p>
                </div>

                {/* Event Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.events.map((event, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col"
                    >
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {event.date}
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-md border border-emerald-100">
                            {event.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex items-start gap-1.5 text-sm text-gray-500 mb-4">
                          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-6 flex-1">
                          {event.description}
                        </p>
                        
                        {event.link && (
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 font-semibold text-sm rounded-xl transition-colors border border-transparent hover:border-emerald-100"
                          >
                            查看詳情 <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Sources */}
                {results.sources.length > 0 && (
                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">資料來源</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.sources.map((source, idx) => (
                        source.web && (
                          <a
                            key={idx}
                            href={source.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-500 px-2 py-1 rounded transition-colors flex items-center gap-1"
                          >
                            {source.web.title || "來源"} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p>請輸入搜尋條件並點擊「開始搜尋」</p>
              </div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400 mb-4">© 2026 台灣活動搜尋趣 - 探索台灣之美</p>
          <div className="flex justify-center gap-6 text-xs font-medium text-gray-400">
            <a href="#" className="hover:text-emerald-600">隱私權政策</a>
            <a href="#" className="hover:text-emerald-600">服務條款</a>
            <a href="#" className="hover:text-emerald-600">聯絡我們</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
