import React from 'react';
import { ProblemItem } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface ProblemEditorProps {
  items: ProblemItem[];
  onItemsChange: (items: ProblemItem[]) => void;
  examTitle: string;
  onExamTitleChange: (value: string) => void;
  problemsTitle: string;
  onProblemsTitleChange: (value: string) => void;
  solutionsTitle: string;
  onSolutionsTitleChange: (value: string) => void;
  footerText: string;
  onFooterTextChange: (value: string) => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  problemGap: number;
  onProblemGapChange: (value: number) => void;
  lineHeight: number;
  onLineHeightChange: (value: number) => void;
}

const ProblemInput: React.FC<{
  item: ProblemItem;
  index: number;
  onUpdate: (id: string, field: 'problem' | 'solution', value: string) => void;
  onRemove: (id: string) => void;
}> = ({ item, index, onUpdate, onRemove }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 relative">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-700">{index + 1}번 문제</h3>
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
          aria-label={`${index + 1}번 문제 삭제`}
        >
          <TrashIcon />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label htmlFor={`problem-${item.id}`} className="block text-sm font-medium text-gray-600 mb-1">문제 내용</label>
          <textarea
            id={`problem-${item.id}`}
            value={item.problem}
            onChange={(e) => onUpdate(item.id, 'problem', e.target.value)}
            placeholder="문제 내용을 입력하세요. LaTex 문법을 지원합니다: $$ ... $$"
            className="w-full h-32 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-mono text-sm bg-white"
          />
        </div>
        <div>
          <label htmlFor={`solution-${item.id}`} className="block text-sm font-medium text-gray-600 mb-1">풀이 내용</label>
          <textarea
            id={`solution-${item.id}`}
            value={item.solution}
            onChange={(e) => onUpdate(item.id, 'solution', e.target.value)}
            placeholder="풀이 내용을 입력하세요."
            className="w-full h-24 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-mono text-sm bg-white"
          />
        </div>
      </div>
    </div>
  );
};

const PaperInfoEditor: React.FC<Omit<ProblemEditorProps, 'items' | 'onItemsChange'>> = ({
    examTitle,
    onExamTitleChange,
    problemsTitle,
    onProblemsTitleChange,
    solutionsTitle,
    onSolutionsTitleChange,
    footerText,
    onFooterTextChange,
    fontSize,
    onFontSizeChange,
    problemGap,
    onProblemGapChange,
    lineHeight,
    onLineHeightChange,
  }) => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-bold text-gray-700 mb-3">시험지 정보</h3>
      <div className="space-y-3">
        <div>
          <label htmlFor="exam-title" className="block text-sm font-medium text-gray-600 mb-1">시험 제목</label>
          <input
            id="exam-title"
            type="text"
            value={examTitle}
            onChange={(e) => onExamTitleChange(e.target.value)}
            placeholder="예: 2026학년도 대학수학능력시험 예상 문제지"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition text-sm bg-white"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="problems-title" className="block text-sm font-medium text-gray-600 mb-1">문제지 제목</label>
            <input
              id="problems-title"
              type="text"
              value={problemsTitle}
              onChange={(e) => onProblemsTitleChange(e.target.value)}
              placeholder="예: 문제지"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition text-sm bg-white"
            />
          </div>
          <div>
            <label htmlFor="solutions-title" className="block text-sm font-medium text-gray-600 mb-1">풀이 제목</label>
            <input
              id="solutions-title"
              type="text"
              value={solutionsTitle}
              onChange={(e) => onSolutionsTitleChange(e.target.value)}
              placeholder="예: 정답 및 풀이"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition text-sm bg-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="font-size" className="block text-sm font-medium text-gray-600 mb-1">폰트 크기 (px)</label>
            <input
              id="font-size"
              type="number"
              value={fontSize}
              onChange={(e) => onFontSizeChange(parseInt(e.target.value, 10) || 16)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition text-sm bg-white"
            />
          </div>
          <div>
            <label htmlFor="problem-gap" className="block text-sm font-medium text-gray-600 mb-1">문제 상하 간격 (px)</label>
            <input
              id="problem-gap"
              type="number"
              value={problemGap}
              onChange={(e) => onProblemGapChange(parseInt(e.target.value, 10) || 64)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition text-sm bg-white"
            />
          </div>
          <div>
            <label htmlFor="line-height" className="block text-sm font-medium text-gray-600 mb-1">줄 간격 (배수)</label>
            <input
              id="line-height"
              type="number"
              step="0.1"
              value={lineHeight}
              onChange={(e) => onLineHeightChange(parseFloat(e.target.value) || 1.8)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition text-sm bg-white"
            />
          </div>
        </div>
        <div>
          <label htmlFor="footer-text" className="block text-sm font-medium text-gray-600 mb-1">하단 문구</label>
          <input
            id="footer-text"
            type="text"
            value={footerText}
            onChange={(e) => onFooterTextChange(e.target.value)}
            placeholder="예: 이 문제지에 관한 저작권은 Mrnoobiest에게 있습니다\n무단 배포 및 상업적 이용을 금합니다."
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition text-sm bg-white"
          />
        </div>
      </div>
    </div>
  );

const BuyMeACoffeeButton: React.FC = () => {
  return (
    <div className="flex justify-center mt-4" style={{ transform: 'scale(1.0)' }}>
      <a
        href="https://www.buymeacoffee.com/aminora"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          backgroundColor: '#FFDD00',
          border: '2px solid #000000',
          borderRadius: '12px',
          padding: '8px 16px',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          fontFamily: 'Cookie, cursive',
          fontSize: '16px',
          color: '#000000',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '50%', 
          width: '24px', 
          height: '24px', 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginRight: '8px',
          fontSize: '14px'
        }}>
          ☕
        </span>
        Love With Coffe
      </a>
    </div>
  );
};

const ProblemEditor: React.FC<ProblemEditorProps> = ({ items, onItemsChange, ...paperInfoProps }) => {
  const handleAddItem = () => {
    onItemsChange([...items, { id: crypto.randomUUID(), problem: '', solution: '' }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      onItemsChange(items.filter(item => item.id !== id));
    }
  };

  const handleUpdateItem = (id: string, field: 'problem' | 'solution', value: string) => {
    onItemsChange(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  return (
    <div className="w-full lg:w-1/2 p-4 md:p-6 bg-gray-50 h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <PaperInfoEditor {...paperInfoProps} />
        {items.map((item, index) => (
          <ProblemInput
            key={item.id}
            item={item}
            index={index}
            onUpdate={handleUpdateItem}
            onRemove={handleRemoveItem}
          />
        ))}
        <button
          onClick={handleAddItem}
          className="w-full flex items-center justify-center py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-4"
        >
          <PlusIcon />
          <span className="ml-2 font-medium">문제 추가</span>
        </button>
        
        {/* Buy Me a Coffee Button */}
        <BuyMeACoffeeButton />
      </div>
    </div>
  );
};

export default ProblemEditor;
