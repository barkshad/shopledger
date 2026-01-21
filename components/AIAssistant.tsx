import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, SearchIcon, StatsIcon, ShoppingCartIcon, ArrowUpRightIcon } from './icons';
import { generateMarketInsights, chatWithAI, analyzeShopPerformance } from '../services/ai';
import { useSales } from '../hooks/useSales';
import { useExpenses } from '../hooks/useExpenses';
import * as statsUtils from '../utils/statsUtils';
import Spinner from './Spinner';

type Tab = 'research' | 'analysis' | 'chat';

const MotionDiv = motion.div as any;

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState<Tab>('research');
  const [query, setQuery] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);

  const { sales } = useSales();
  const { expenses } = useExpenses();

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setGroundingMetadata(null);
    try {
      const response = await generateMarketInsights(query);
      setResult(response.text);
      setGroundingMetadata(response.groundingMetadata);
    } catch (error) {
      setResult("Sorry, I couldn't fetch that information right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    // Optimistic UI update or loading state could go here
    try {
        const response = await chatWithAI(userMsg);
        setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
        setChatHistory(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now." }]);
    }
  };

  const handleAnalysis = async () => {
    setLoading(true);
    setResult(null);
    
    const trends = statsUtils.calculateTrends(sales, expenses);
    const topProducts = statsUtils.getTopProducts(sales);
    
    const summaryData = `
      Total Sales (Lifetime): ${sales.length}
      Total Revenue (Lifetime): ${sales.reduce((acc, s) => acc + s.total, 0)}
      Today's Sales: ${trends.daily.current}
      Weekly Sales: ${trends.weekly.current}
      Top Products: ${topProducts.map(p => `${p.name} (${p.revenue})`).join(', ')}
    `;

    try {
      const response = await analyzeShopPerformance(summaryData);
      setResult(response);
    } catch (error) {
      setResult("Could not analyze data at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-zinc-900 to-zinc-600 rounded-2xl shadow-lg">
            <SparklesIcon className="w-8 h-8 text-white" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface">Smart Assistant</h1>
            <p className="text-subtle-text">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="bg-surface dark:bg-dark-surface rounded-2xl shadow-soft border border-border-color dark:border-dark-border-color overflow-hidden">
        <div className="flex border-b border-border-color dark:border-dark-border-color">
          <button
            onClick={() => setActiveTab('research')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'research' ? 'bg-zinc-100 dark:bg-zinc-800 text-primary dark:text-white border-b-2 border-primary dark:border-white' : 'text-subtle-text hover:bg-background'}`}
          >
            <SearchIcon className="w-4 h-4" /> Market Research
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'analysis' ? 'bg-zinc-100 dark:bg-zinc-800 text-primary dark:text-white border-b-2 border-primary dark:border-white' : 'text-subtle-text hover:bg-background'}`}
          >
            <StatsIcon className="w-4 h-4" /> Shop Analysis
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'bg-zinc-100 dark:bg-zinc-800 text-primary dark:text-white border-b-2 border-primary dark:border-white' : 'text-subtle-text hover:bg-background'}`}
          >
            <SparklesIcon className="w-4 h-4" /> Quick Chat
          </button>
        </div>

        <div className="p-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'research' && (
              <MotionDiv
                key="research"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Google Search Grounding</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">Ask about current market prices, trends, or business advice. Real-time data sourced from Google.</p>
                </div>

                <form onSubmit={handleResearch} className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="E.g., Current wholesale price of sugar in Kenya..."
                    className="w-full pl-4 pr-12 py-3 bg-background dark:bg-dark-background border border-border-color rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="absolute right-2 top-2 p-2 bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-zinc-800 transition-colors"
                  >
                    {loading ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <ArrowUpRightIcon className="w-5 h-5" />}
                  </button>
                </form>

                {result && (
                  <div className="prose dark:prose-invert max-w-none bg-background dark:bg-dark-background p-6 rounded-xl border border-border-color">
                    <div className="whitespace-pre-wrap">{result}</div>
                    
                    {groundingMetadata?.groundingChunks && (
                      <div className="mt-4 pt-4 border-t border-border-color">
                        <p className="text-xs font-semibold text-subtle-text uppercase mb-2">Sources</p>
                        <div className="space-y-1">
                          {groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                             chunk.web?.uri && (
                                <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block text-sm text-zinc-900 dark:text-zinc-100 font-medium hover:underline truncate">
                                  {chunk.web.title || chunk.web.uri}
                                </a>
                             )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </MotionDiv>
            )}

            {activeTab === 'analysis' && (
              <MotionDiv
                key="analysis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-center"
              >
                <div className="max-w-md mx-auto">
                    <ShoppingCartIcon className="w-16 h-16 mx-auto text-primary dark:text-white mb-4" />
                    <h3 className="text-xl font-bold mb-2">Analyze Your Shop's Health</h3>
                    <p className="text-subtle-text mb-6">Get AI-driven insights based on your actual sales and expense data. Discover trends and get actionable tips.</p>
                    
                    <button
                        onClick={handleAnalysis}
                        disabled={loading}
                        className="px-6 py-3 bg-primary dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold rounded-xl shadow-lg hover:bg-zinc-800 dark:hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                        {loading ? 'Analyzing...' : 'Generate Insights'}
                        {!loading && <SparklesIcon className="w-5 h-5" />}
                    </button>
                </div>

                {loading && <Spinner />}

                {result && !loading && (
                    <div className="text-left bg-background dark:bg-dark-background p-6 rounded-xl border border-border-color whitespace-pre-wrap mt-8">
                        {result}
                    </div>
                )}
              </MotionDiv>
            )}

            {activeTab === 'chat' && (
              <MotionDiv
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-[500px]"
              >
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {chatHistory.length === 0 && (
                        <div className="text-center text-subtle-text mt-20">
                            <SparklesIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Ask me anything about running your shop!</p>
                        </div>
                    )}
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                                msg.role === 'user' 
                                ? 'bg-primary text-white rounded-tr-none' 
                                : 'bg-background dark:bg-dark-background border border-border-color rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleChat} className="mt-auto relative">
                     <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full pl-4 pr-12 py-3 bg-background dark:bg-dark-background border border-border-color rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!chatMessage.trim()}
                        className="absolute right-2 top-2 p-2 bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-zinc-800 transition-colors"
                      >
                        <ArrowUpRightIcon className="w-5 h-5" />
                      </button>
                </form>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;