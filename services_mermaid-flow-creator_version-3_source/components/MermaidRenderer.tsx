
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false, // Changed to false to handle manual rendering better
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter',
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
  },
});

interface MermaidRendererProps {
  code: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const render = async () => {
      if (!containerRef.current || !code.trim()) {
        setError(null);
        return;
      }
      
      try {
        setError(null);
        // Clear previous content
        containerRef.current.innerHTML = '';
        
        // Generate a unique ID for each render to avoid conflicts
        const id = `mermaid-svg-${Math.random().toString(36).substring(2, 11)}`;
        
        // Basic validation: Check if it starts with a known keyword
        const trimmedCode = code.trim();
        const validStart = /^(flowchart|sequenceDiagram|stateDiagram|graph|classDiagram|erDiagram|gantt|pie|journey|gitGraph)/i.test(trimmedCode);
        
        if (!validStart) {
          throw new Error("マーメイド記法の形式が正しくありません。");
        }

        const { svg } = await mermaid.render(id, trimmedCode);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (e) {
        console.error("Mermaid Render Error:", e);
        setError("図の生成に失敗しました。AIが作成したコードに文法エラーが含まれている可能性があります。再度「生成」を試すか、コードを直接修正してください。");
      }
    };

    // Use a small timeout to ensure the DOM is ready and avoid race conditions
    const timer = setTimeout(render, 50);
    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-lg border border-slate-200 overflow-auto p-4 transition-all">
      {error ? (
        <div className="max-w-md text-red-500 bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-bold text-lg">レンダリングエラー</p>
          </div>
          <p className="text-sm leading-relaxed mb-4">{error}</p>
          <div className="bg-white/50 p-3 rounded-lg border border-red-100 font-mono text-xs overflow-auto max-h-32">
            {code.length > 200 ? code.substring(0, 200) + '...' : code}
          </div>
        </div>
      ) : code.trim() ? (
        <div ref={containerRef} className="w-full flex justify-center animate-in fade-in duration-500" />
      ) : (
        <div className="text-slate-400 flex flex-col items-center select-none py-10">
          <svg className="w-16 h-16 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-medium text-slate-500">プレビューがここに表示されます</p>
          <p className="text-xs text-slate-400 mt-1">作業内容を入力して生成ボタンを押してください</p>
        </div>
      )}
    </div>
  );
};

export default MermaidRenderer;
