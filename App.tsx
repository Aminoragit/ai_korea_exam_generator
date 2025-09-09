import React, { useState, useRef, useCallback } from 'react';
import { ProblemItem } from './types';
import ProblemEditor from './components/ProblemEditor';
import PaperPreview from './components/PaperPreview';

// Declare CDN libraries on the window object for TypeScript
declare global {
  interface Window {
    MathJax: any;
  }
}

const App: React.FC = () => {
  const [items, setItems] = useState<ProblemItem[]>([
    { 
      id: crypto.randomUUID(), 
      problem: '함수 $f(x)=x^2-x+1$에 대하여 $\\lim_{h \\to 0} \\frac{f(1+h)-f(1)}{h}$의 값은? [2점]\n\n① 1   ② 2   ③ 3   ④ 4   ⑤ 5', 
      solution: 'f\'(x) = 2x - 1\n따라서 구하는 값은 f\'(1) = 2(1) - 1 = 1 입니다.\n정답: ①'
    },
  ]);
  const [examTitle, setExamTitle] = useState('2026학년도 대학수학능력시험 예상 문제지');
  const [problemsTitle, setProblemsTitle] = useState('문제지');
  const [solutionsTitle, setSolutionsTitle] = useState('정답 및 풀이');
  const [footerText, setFooterText] = useState('이 문제지에 관한 저작권은 Mrnoobiest에게 있습니다\n무단 배포 및 상업적 이용을 금합니다.');
  const [fontSize, setFontSize] = useState(16);
  const [problemGap, setProblemGap] = useState(64);
  const [lineHeight, setLineHeight] = useState(1.8);

  const problemsRef = useRef<HTMLDivElement>(null);
  const solutionsRef = useRef<HTMLDivElement>(null);

  const handlePrintToPDF = useCallback(() => {
    // 브라우저의 인쇄 다이얼로그 열기 - 이를 통해 PDF로 저장 가능
    window.print();
  }, []);

  const handleDownloadMarkdown = useCallback(() => {
    let mdContent = `# ${examTitle}\n\n`;
    mdContent += `## ${problemsTitle}\n\n---\n\n`;
    items.forEach((item, index) => {
      mdContent += `**${index + 1}.**\n\n${item.problem}\n\n---\n\n`;
    });
    mdContent += `\n## ${solutionsTitle}\n\n---\n\n`;
    items.forEach((item, index) => {
      mdContent += `**${index + 1}.**\n\n${item.solution}\n\n---\n\n`;
    });
    mdContent += `*${footerText}*`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${examTitle.replace(/ /g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [items, examTitle, problemsTitle, solutionsTitle, footerText]);

  const handleSaveJSON = useCallback(() => {
    const data = {
      examTitle,
      problemsTitle,
      solutionsTitle,
      footerText,
      fontSize,
      problemGap,
      lineHeight,
      items: items.map(item => ({
        problem: item.problem,
        solution: item.solution
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${examTitle.replace(/ /g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [items, examTitle, problemsTitle, solutionsTitle, footerText, fontSize, problemGap, lineHeight]);

  const handleLoadJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            
            // 데이터 유효성 검사
            if (data.items && Array.isArray(data.items)) {
              // 아이템에 ID 추가
              const itemsWithIds = data.items.map((item: any) => ({
                id: crypto.randomUUID(),
                problem: item.problem || '',
                solution: item.solution || ''
              }));
              
              setItems(itemsWithIds);
              
              // 다른 설정들도 불러오기
              if (data.examTitle) setExamTitle(data.examTitle);
              if (data.problemsTitle) setProblemsTitle(data.problemsTitle);
              if (data.solutionsTitle) setSolutionsTitle(data.solutionsTitle);
              if (data.footerText) setFooterText(data.footerText);
              if (data.fontSize) setFontSize(data.fontSize);
              if (data.problemGap) setProblemGap(data.problemGap);
              if (data.lineHeight) setLineHeight(data.lineHeight);
              
              alert('파일이 성공적으로 불러와졌습니다.');
            } else {
              alert('올바른 형식의 JSON 파일이 아닙니다.');
            }
          } catch (error) {
            alert('파일을 읽는 중 오류가 발생했습니다.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);


  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-gray-100 text-gray-800">
      <header className="w-full lg:hidden p-4 bg-white shadow-md z-20">
        <h1 className="text-xl font-bold text-center">AI 시험지 생성기</h1>
      </header>
      <ProblemEditor 
        items={items} 
        onItemsChange={setItems}
        examTitle={examTitle}
        onExamTitleChange={setExamTitle}
        problemsTitle={problemsTitle}
        onProblemsTitleChange={setProblemsTitle}
        solutionsTitle={solutionsTitle}
        onSolutionsTitleChange={setSolutionsTitle}
        footerText={footerText}
        onFooterTextChange={setFooterText}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        problemGap={problemGap}
        onProblemGapChange={setProblemGap}
        lineHeight={lineHeight}
        onLineHeightChange={setLineHeight}
      />
      <div className="hidden lg:block w-px bg-gray-300"></div>
      <PaperPreview 
        items={items}
        problemsRef={problemsRef}
        solutionsRef={solutionsRef}
        onDownloadPDF={handlePrintToPDF}
        onDownloadMarkdown={handleDownloadMarkdown}
        onSaveJSON={handleSaveJSON}
        onLoadJSON={handleLoadJSON}
        isGeneratingPDF={false}
        examTitle={examTitle}
        problemsTitle={problemsTitle}
        solutionsTitle={solutionsTitle}
        footerText={footerText}
        fontSize={fontSize}
        problemGap={problemGap}
        lineHeight={lineHeight}
      />
    </div>
  );
};

export default App;