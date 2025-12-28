
import React, { useState } from 'react';
import { DiagramType } from './types';
import { convertToMermaid } from './services/geminiService';
import MermaidRenderer from './components/MermaidRenderer';

interface DiagramState {
  code: string;
  rendered: string;
  isLoading: boolean;
  error: string | null;
}

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<DiagramType[]>([
    DiagramType.FLOWCHART,
    DiagramType.SEQUENCE,
    DiagramType.STATE
  ]);
  const [outputs, setOutputs] = useState<Record<DiagramType, DiagramState>>({
    [DiagramType.FLOWCHART]: { code: '', rendered: '', isLoading: false, error: null },
    [DiagramType.SEQUENCE]: { code: '', rendered: '', isLoading: false, error: null },
    [DiagramType.STATE]: { code: '', rendered: '', isLoading: false, error: null },
  });

  const toggleTypeSelection = (type: DiagramType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const handleConvertSelected = async () => {
    if (!inputText.trim()) {
      alert("入力テキストが空です。");
      return;
    }

    if (selectedTypes.length === 0) {
      alert("生成する図の種類を少なくとも1つ選択してください。");
      return;
    }

    // Initialize loading states only for selected types
    setOutputs(prev => {
      const next = { ...prev };
      selectedTypes.forEach(t => {
        next[t] = { ...next[t], isLoading: true, error: null };
      });
      return next;
    });

    // Run generations in parallel for selected types
    await Promise.all(selectedTypes.map(async (type) => {
      try {
        const code = await convertToMermaid(inputText, type);
        setOutputs(prev => ({
          ...prev,
          [type]: { ...prev[type], code, isLoading: false, error: null }
        }));
      } catch (error) {
        setOutputs(prev => ({
          ...prev,
          [type]: { ...prev[type], isLoading: false, error: error instanceof Error ? error.message : "エラーが発生しました。" }
        }));
      }
    }));
  };

  const updateOutput = (type: DiagramType, code: string) => {
    setOutputs(prev => ({
      ...prev,
      [type]: { ...prev[type], code }
    }));
  };

  const renderDiagram = (type: DiagramType) => {
    setOutputs(prev => ({
      ...prev,
      [type]: { ...prev[type], rendered: prev[type].code }
    }));
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("コピーしました！");
  };

  const handleClear = () => {
    setInputText('');
    setOutputs({
      [DiagramType.FLOWCHART]: { code: '', rendered: '', isLoading: false, error: null },
      [DiagramType.SEQUENCE]: { code: '', rendered: '', isLoading: false, error: null },
      [DiagramType.STATE]: { code: '', rendered: '', isLoading: false, error: null },
    });
  };

  const sampleInputs = [
    { label: "フローチャート例", text: "企画立案\n↓\n設計\n↓\n開発\n↓\nテスト\n↓\nリリース" },
    { label: "シーケンス例", text: "ユーザーがログインボタンを押す\nサーバーが認証を行う\nデータベースに照会する\n結果をユーザーに返す" }
  ];

  const diagramLabels: Record<DiagramType, string> = {
    [DiagramType.FLOWCHART]: "フローチャート",
    [DiagramType.SEQUENCE]: "シーケンス図",
    [DiagramType.STATE]: "状態遷移図",
  };

  const isAnyLoading = (Object.values(outputs) as DiagramState[]).some(o => o.isLoading);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500 p-2 rounded-lg text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Mermaid Flow Creator</h1>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">
            作業内容を自由な形式の図に変換
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-6 flex flex-col gap-8">
        
        {/* Input & Selection Section */}
        <section className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="font-semibold text-slate-700">1. 作業内容を入力 & 図の種類を選択</h2>
            <div className="flex gap-4">
              {sampleInputs.map((sample, i) => (
                <button 
                  key={i}
                  onClick={() => setInputText(sample.text)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-100 border-b border-slate-200">
             <div className="flex flex-wrap gap-3">
               {(Object.keys(diagramLabels) as DiagramType[]).map((type) => (
                 <button
                  key={type}
                  onClick={() => toggleTypeSelection(type)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 border ${
                    selectedTypes.includes(type)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                  }`}
                 >
                   <div className={`w-3 h-3 rounded-full ${selectedTypes.includes(type) ? 'bg-white' : 'bg-slate-300'}`} />
                   {diagramLabels[type]}
                 </button>
               ))}
             </div>
          </div>

          <textarea
            className="w-full h-40 p-6 resize-none focus:outline-none bg-slate-800 text-white placeholder-slate-400 text-lg leading-relaxed"
            placeholder="ここに作業内容を入力してください..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-4">
            <button
              onClick={handleConvertSelected}
              disabled={isAnyLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] ${
                isAnyLoading 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isAnyLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  選択した図を生成
                </>
              )}
            </button>
            <button 
              onClick={handleClear}
              className="px-6 py-3 text-slate-500 hover:text-red-600 font-semibold transition-colors"
            >
              クリア
            </button>
          </div>
        </section>

        {/* Results Grid - Dynamically sized based on selection */}
        <div className={`grid grid-cols-1 ${
          selectedTypes.length === 2 ? 'lg:grid-cols-2' : 
          selectedTypes.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-1'
        } gap-6`}>
          {selectedTypes.map((type) => {
            const state = outputs[type];
            return (
              <section key={type} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-full min-h-[600px]">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">{diagramLabels[type]}</h3>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleCopy(state.code)}
                        disabled={!state.code}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 disabled:opacity-30 rounded-md hover:bg-slate-100 transition-all"
                        title="コードをコピー"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Preview Area */}
                  <div className="flex-1 p-4 bg-white relative overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-auto rounded-lg border border-slate-100 mb-4 bg-slate-50/50">
                      {state.isLoading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                          <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-sm font-medium">生成中...</p>
                        </div>
                      ) : (
                        <MermaidRenderer code={state.rendered || state.code} />
                      )}
                    </div>

                    {/* Code Editor Area */}
                    <div className="h-48 flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Mermaid Syntax</span>
                         <button 
                           onClick={() => renderDiagram(type)}
                           className="text-[10px] text-indigo-600 font-bold hover:underline"
                         >
                           図を更新
                         </button>
                      </div>
                      <textarea
                        className="flex-1 p-3 mono text-xs focus:outline-none bg-slate-900 text-white rounded-lg resize-none border border-slate-700"
                        value={state.code}
                        onChange={(e) => updateOutput(type, e.target.value)}
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  {state.error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs border-t border-red-100">
                      {state.error}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
          {selectedTypes.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
              <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p className="text-lg">生成する図の種類を上のボタンから選択してください</p>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 p-8 text-center text-slate-500 text-sm mt-auto">
        <p className="font-medium mb-1">&copy; 2025 Mermaid Flow Creator</p>
        <p className="text-slate-400">AIが入力テキストを解析し、最適な図式を自動生成します。</p>
      </footer>
    </div>
  );
};

export default App;
