import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ProblemItem } from '../types';
import { PdfIcon, MarkdownIcon, SaveIcon, LoadIcon, ShutdownIcon } from './icons';

// Declare MathJax on the window object for TypeScript
declare global {
    interface Window {
      MathJax: any;
    }
}

interface PaperPreviewProps {
  items: ProblemItem[];
  problemsRef: React.RefObject<HTMLDivElement>;
  solutionsRef: React.RefObject<HTMLDivElement>;
  onDownloadPDF: () => void;
  onDownloadMarkdown: () => void;
  onSaveJSON: () => void;
  onLoadJSON: () => void;
  isGeneratingPDF: boolean;
  examTitle: string;
  problemsTitle: string;
  solutionsTitle: string;
  footerText: string;
  fontSize: number;
  problemGap: number;
  lineHeight: number;
}

// Represents a single piece of content (a problem or a solution) placed on a page.
interface PaperSheetItem {
    id: string;
    content: string;
    number: number;
    col: number; // The column on the page (0 for left, 1 for right)
}

// Represents a single A4 page, which contains items for its two columns.
type Page = PaperSheetItem[];

// A helper component to render a single problem/solution with its number.
const ContentItem: React.FC<{ number: number; content: string; gap: number, lineHeight: number }> = React.memo(({ number, content, gap, lineHeight }) => (
    <div style={{ marginBottom: `${gap}px`, lineHeight: lineHeight }}>
        <div className="flex flex-row items-start">
            <span className="font-bold w-8 flex-shrink-0">{number}.</span>
            <div className="flex-1" style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
        </div>
    </div>
));

// Renders a single A4 page with a header, footer, and two columns of content.
const PaperSheet: React.FC<{
  title: string;
  examTitle: string;
  footerText: string;
  items: PaperSheetItem[];
  pageNumber: number;
  totalPages: number;
  fontSize: number;
  problemGap: number;
  lineHeight: number;
}> = ({ title, examTitle, footerText, items, pageNumber, totalPages, fontSize, problemGap, lineHeight }) => {
    const leftColItems = items.filter(item => item.col === 0);
    const rightColItems = items.filter(item => item.col === 1);

    return (
        <div className="bg-white shadow-lg p-8 w-a4 min-h-a4 paper-page flex flex-col" style={{ fontSize: `${fontSize}px` }}>
            <header className="w-full text-center py-6 border-b-4 border-black">
                <h1 className="text-3xl font-black">{examTitle}</h1>
            </header>
            <main className="flex-grow flex my-6" style={{ columnGap: '1.5rem' }}>
                <div className="w-1/2">
                    {leftColItems.map(item => <ContentItem key={item.id} number={item.number} content={item.content} gap={problemGap} lineHeight={lineHeight} />)}
                </div>
                <div className="w-1/2">
                    {rightColItems.map(item => <ContentItem key={item.id} number={item.number} content={item.content} gap={problemGap} lineHeight={lineHeight} />)}
                </div>
            </main>
            <footer className="w-full text-center text-sm pb-4 pt-2 border-t-2 border-black">
                <p className="font-bold">{title}</p>
                <p>{footerText}</p>
                <p className="font-sans mt-2">{pageNumber} / {totalPages}</p>
            </footer>
        </div>
    );
};

// Renders a complete document (e.g., all problem pages)
const PaperContainer: React.FC<{
    pages: Page[];
    title: string;
    examTitle: string;
    footerText: string;
    fontSize: number;
    problemGap: number;
    lineHeight: number;
    containerRef: React.RefObject<HTMLDivElement>;
}> = ({ pages, title, examTitle, footerText, fontSize, problemGap, lineHeight, containerRef }) => (
    <div ref={containerRef} className="space-y-4 paper-container">
        {pages.map((pageItems, i) => (
            // FIX: Pass the footerText prop to the PaperSheet component.
            <PaperSheet
                key={i}
                title={title}
                examTitle={examTitle}
                footerText={footerText}
                items={pageItems}
                pageNumber={i + 1}
                totalPages={pages.length}
                fontSize={fontSize}
                problemGap={problemGap}
                lineHeight={lineHeight}
            />
        ))}
    </div>
);

const PaperPreview: React.FC<PaperPreviewProps> = ({
  items,
  onDownloadPDF,
  onDownloadMarkdown,
  onSaveJSON,
  onLoadJSON,
  isGeneratingPDF,
  examTitle,
  problemsTitle,
  solutionsTitle,
  footerText,
  fontSize,
  problemGap,
  lineHeight,
  problemsRef,
  solutionsRef,
}) => {
  const [problemPages, setProblemPages] = useState<Page[]>([]);
  const [solutionPages, setSolutionPages] = useState<Page[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const measurementRef = useRef<HTMLDivElement>(null);

  const handleShutdown = useCallback(async () => {
    const confirmed = window.confirm('서버를 종료하시겠습니까?\n브라우저 창도 함께 닫힙니다.');
    if (confirmed) {
      // 오버레이 div 생성
      const overlay = document.createElement('div');
      overlay.id = 'shutdown-overlay';
      overlay.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">
          <div style="
            background-color: #1f2937;
            color: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            max-width: 400px;
            width: 90%;
          ">
            <h1 style="
              font-size: 1.5rem;
              margin-bottom: 1rem;
              margin-top: 0;
              font-weight: bold;
            ">AI 시험지 생성기</h1>
            <p style="
              font-size: 1rem;
              margin-bottom: 2rem;
              color: #d1d5db;
            ">서버를 종료하고 있습니다...</p>
            <div style="
              width: 40px;
              height: 40px;
              border: 4px solid #374151;
              border-top: 4px solid #10b981;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto;
            "></div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </div>
        </div>
      `;
      
      // 페이지에 오버레이 추가
      document.body.appendChild(overlay);

      try {
        await fetch('/api/shutdown', { method: 'POST' });
        
        // 성공 시 오버레이 내용 업데이트
        setTimeout(() => {
          const overlayElement = document.getElementById('shutdown-overlay');
          if (overlayElement) {
            overlayElement.innerHTML = `
              <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              ">
                <div style="
                  background-color: #059669;
                  color: white;
                  padding: 40px;
                  border-radius: 12px;
                  text-align: center;
                  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                  max-width: 400px;
                  width: 90%;
                ">
                  <h1 style="
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    margin-top: 0;
                    font-weight: bold;
                  ">✅ 서버 종료 완료</h1>
                  <p style="
                    font-size: 1rem;
                    margin-bottom: 1rem;
                    color: #d1fae5;
                  ">AI 시험지 생성기 서버가 성공적으로 종료되었습니다.</p>
                  <p style="
                    font-size: 0.9rem;
                    color: #a7f3d0;
                  ">잠시 후 탭이 자동으로 닫힙니다.</p>
                </div>
              </div>
            `;
          }
        }, 1000);
        
      } catch (error) {
        // 서버가 종료되어 에러가 발생하는 것은 정상
        console.log('서버가 종료되었습니다.');
        
        // 에러 발생시에도 성공 메시지 표시
        setTimeout(() => {
          const overlayElement = document.getElementById('shutdown-overlay');
          if (overlayElement) {
            overlayElement.innerHTML = `
              <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              ">
                <div style="
                  background-color: #059669;
                  color: white;
                  padding: 40px;
                  border-radius: 12px;
                  text-align: center;
                  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                  max-width: 400px;
                  width: 90%;
                ">
                  <h1 style="
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    margin-top: 0;
                    font-weight: bold;
                  ">✅ 서버 종료 완료</h1>
                  <p style="
                    font-size: 1rem;
                    margin-bottom: 1rem;
                    color: #d1fae5;
                  ">AI 시험지 생성기 서버가 성공적으로 종료되었습니다.</p>
                  <p style="
                    font-size: 0.9rem;
                    color: #a7f3d0;
                  ">잠시 후 탭이 자동으로 닫힙니다.</p>
                </div>
              </div>
            `;
          }
        }, 1000);
      }
      
      // 현재 탭 닫기 시도
      setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          console.log('window.close() 실패');
          
          // 창이 닫히지 않으면 about:blank로 이동
          setTimeout(() => {
            try {
              window.location.href = 'about:blank';
              window.close();
            } catch (e) {
              console.log('about:blank 이동 실패');
              // 최후의 수단으로 히스토리 back
              history.back();
            }
          }, 500);
        }
      }, 3000);
    }
  }, []);
  
  const calculateLayout = useCallback(async () => {
    if (!measurementRef.current) return;

    setIsCalculating(true);

    try {
      if (window.MathJax && window.MathJax.typesetPromise) {
        await window.MathJax.typesetPromise([measurementRef.current]);
      }

      const itemHeights: { [id: string]: { problem: number; solution: number } } = {};
      const children = Array.from(measurementRef.current.children);
      children.forEach(child => {
          const id = child.getAttribute('data-id');
          const type = child.getAttribute('data-type');
          if (id && type) {
              if (!itemHeights[id]) itemHeights[id] = { problem: 0, solution: 0 };
              itemHeights[id][type as 'problem' | 'solution'] = child.getBoundingClientRect().height;
          }
      });
      
      const A4_HEIGHT_PX = 1123;
      const pagePadding = 32 * 2; // p-8 from tailwind
      const headerHeight = 85; // Estimated
      const footerHeight = 75; // Estimated
      const verticalGapHeight = 24 * 2; // my-6
      const availableHeight = A4_HEIGHT_PX - pagePadding - headerHeight - footerHeight - verticalGapHeight;
      
      const paginate = (contentItems: {id: string, content: string}[], type: 'problem' | 'solution') => {
        const pages: Page[] = [];
        if (contentItems.length === 0) return [];

        let currentPage: Page = [];
        let currentCol = 0;
        let currentHeight = 0;

        contentItems.forEach((item, index) => {
            const itemHeight = (itemHeights[item.id]?.[type] || 0) + problemGap;

            const placeItem = () => {
                currentPage.push({ ...item, number: index + 1, col: currentCol, content: item.content });
                currentHeight += itemHeight;
            };

            const startNewPage = () => {
                if (currentPage.length > 0) pages.push(currentPage);
                currentPage = [];
                currentCol = 0;
                currentHeight = 0;
            };
            
            if (currentHeight + itemHeight <= availableHeight) {
                placeItem();
            } else if (currentCol === 0) {
                currentCol = 1;
                currentHeight = 0;
                if (itemHeight <= availableHeight) {
                    placeItem();
                } else {
                    startNewPage();
                    placeItem();
                }
            } else {
                startNewPage();
                placeItem();
            }
        });

        if (currentPage.length > 0) pages.push(currentPage);
        
        return pages.length > 0 ? pages : [];
      };

      const problems = items.map(({id, problem}) => ({id, content: problem}));
      const solutions = items.map(({id, solution}) => ({id, content: solution}));
      
      setProblemPages(paginate(problems, 'problem'));
      setSolutionPages(paginate(solutions, 'solution'));

    } catch (error) {
        console.error("Error during layout calculation:", error);
    } finally {
        setIsCalculating(false);
    }
  }, [items, fontSize, problemGap, lineHeight]);

  useEffect(() => {
      const handler = setTimeout(() => {
          calculateLayout();
      }, 500);

      return () => {
          clearTimeout(handler);
      };
  }, [calculateLayout]);

  // This effect runs after the layout is calculated and the pages are rendered to the DOM.
  // It tells MathJax to typeset the math in the visible problem and solution sheets.
  useEffect(() => {
    // Only run typesetting when calculation is finished.
    if (!isCalculating) {
      if (window.MathJax && window.MathJax.typesetPromise) {
        const elementsToTypeset: HTMLElement[] = [];
        if (problemsRef.current) elementsToTypeset.push(problemsRef.current);
        if (solutionsRef.current) elementsToTypeset.push(solutionsRef.current);

        if (elementsToTypeset.length > 0) {
          window.MathJax.typesetPromise(elementsToTypeset)
            .catch((err: any) => console.error('MathJax final typesetting error:', err));
        }
      }
    }
  }, [isCalculating, problemPages, solutionPages, problemsRef, solutionsRef]);

  return (
    <div className="w-full lg:w-1/2 p-4 md:p-6 h-full overflow-y-auto bg-gray-200">
      <div className="flex justify-center mb-4 no-print sticky top-0 py-2 bg-gray-200 z-10">
        <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={onDownloadPDF}
              disabled={isCalculating || isGeneratingPDF}
              className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <PdfIcon />
              {isCalculating ? '계산 중...' : isGeneratingPDF ? 'PDF 생성 중...' : 'PDF로 인쇄'}
            </button>
            <button
              onClick={onDownloadMarkdown}
              disabled={isCalculating}
              className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <MarkdownIcon />
              {isCalculating ? '계산 중...' : 'Markdown 다운로드'}
            </button>
            <button
              onClick={onSaveJSON}
              disabled={isCalculating}
              className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <SaveIcon />
              {isCalculating ? '계산 중...' : 'JSON 저장'}
            </button>
            <button
              onClick={onLoadJSON}
              disabled={isCalculating}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <LoadIcon />
              {isCalculating ? '계산 중...' : 'JSON 불러오기'}
            </button>
            <button
              onClick={handleShutdown}
              className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center"
            >
              <ShutdownIcon />
              서버 종료
            </button>
        </div>
      </div>

      <div ref={measurementRef} style={{
          position: 'absolute',
          left: '-9999px',
          top: '0px',
          width: 'calc(105mm - 4rem)', // Half A4 width minus padding
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}`,
          visibility: 'hidden',
          pointerEvents: 'none',
      }}>
          {items.map((item, index) => (
              <React.Fragment key={item.id}>
                  <div data-id={item.id} data-type="problem">
                      <ContentItem number={index + 1} content={item.problem} gap={problemGap} lineHeight={lineHeight} />
                  </div>
                  <div data-id={item.id} data-type="solution">
                      <ContentItem number={index + 1} content={item.solution} gap={problemGap} lineHeight={lineHeight} />
                  </div>
              </React.Fragment>
          ))}
      </div>

      <div className="flex flex-col items-center">
        <PaperContainer
            pages={problemPages}
            title={problemsTitle}
            examTitle={examTitle}
            footerText={footerText}
            fontSize={fontSize}
            problemGap={problemGap}
            lineHeight={lineHeight}
            containerRef={problemsRef}
        />
        <div className="h-8"></div>
        <PaperContainer
            pages={solutionPages}
            title={solutionsTitle}
            examTitle={examTitle}
            footerText={footerText}
            fontSize={fontSize}
            problemGap={problemGap}
            lineHeight={lineHeight}
            containerRef={solutionsRef}
        />
      </div>
    </div>
  );
};

export default PaperPreview;