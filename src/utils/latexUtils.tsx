import katex from 'katex';
import React from 'react';
import { ExamPaper, ExamQuestion } from '../types';

/**
 * Danh sách ký hiệu toán học thông dụng hỗ trợ giáo viên nhập nhanh LaTeX / MathType
 */
export const LATEX_MATH_SYMBOLS = [
  { label: '√x', latex: '$\\sqrt{x}$', tooltip: 'Căn bậc hai' },
  { label: 'ⁿ√x', latex: '$\\sqrt[n]{x}$', tooltip: 'Căn bậc n' },
  { label: 'a/b', latex: '$\\frac{a}{b}$', tooltip: 'Phân số' },
  { label: 'x²', latex: '$x^2$', tooltip: 'Bình phương' },
  { label: 'xⁿ', latex: '$x^n$', tooltip: 'Lũy thừa mũ n' },
  { label: 'xᵢ', latex: '$x_i$', tooltip: 'Chỉ số dưới' },
  { label: '≥', latex: '$\\ge$', tooltip: 'Lớn hơn hoặc bằng' },
  { label: '≤', latex: '$\\le$', tooltip: 'Nhỏ hơn hoặc bằng' },
  { label: '≠', latex: '$\\ne$', tooltip: 'Khác' },
  { label: '±', latex: '$\\pm$', tooltip: 'Cộng trừ' },
  { label: '·', latex: '$\\cdot$', tooltip: 'Dấu nhân' },
  { label: '∈', latex: '$\\in$', tooltip: 'Thuộc tập hợp' },
  { label: 'ℝ', latex: '$\\mathbb{R}$', tooltip: 'Tập số thực' },
  { label: '⊥', latex: '$\\perp$', tooltip: 'Vuông góc' },
  { label: '//', latex: '$\\parallel$', tooltip: 'Song song' },
  { label: '∠A', latex: '$\\widehat{A}$', tooltip: 'Góc' },
  { label: '△ABC', latex: '$\\Delta ABC$', tooltip: 'Tam giác' },
  { label: 'sin', latex: '$\\sin$', tooltip: 'Sin' },
  { label: 'cos', latex: '$\\cos$', tooltip: 'Cos' },
  { label: 'tan', latex: '$\\tan$', tooltip: 'Tan' },
  { label: 'π', latex: '$\\pi$', tooltip: 'Số Pi' },
  { label: 'Hệ PT', latex: '$\\begin{cases} ax + by = c \\\\ a\'x + b\'y = c\' \\end{cases}$', tooltip: 'Hệ phương trình' },
  { label: '⇔', latex: '$\\Leftrightarrow$', tooltip: 'Tương đương' },
  { label: '⇒', latex: '$\\Rightarrow$', tooltip: 'Suy ra' },
];

/**
 * Tự động chuyển đổi các ký tự toán Unicode rời rạc thành cú pháp LaTeX chuẩn
 */
export function normalizeToLatex(input: string): string {
  if (!input) return '';
  let text = input;

  // Nếu chuỗi hoàn toàn chưa có dấu $, kiểm tra xem có phải là toàn bộ một công thức hay không
  // Ví dụ các lựa chọn: "x >= 3", "2 - √3", "AH² = BH · CH", "y = 2x - 5"
  const isPureMathExpr =
    !text.includes('$') &&
    (
      /^[a-zA-Z0-9\s+\-*\/=^()[\],.<>≥≤≠±√·|\\:]+$/.test(text.trim()) &&
      (/[=><≥≤≠±√·^²³⁴]/.test(text) || /^[0-9]+([.,][0-9]+)?$/.test(text.trim()) || /^[a-zA-Z]\s*=\s*/.test(text.trim()))
    );

  // Xử lý các đoạn bên ngoài dấu $
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

  const processedParts = parts.map((part) => {
    // Nếu phần này đã nằm trong $...$ hoặc $$...$$, chỉ cần chuẩn hóa nhẹ bên trong
    if (part.startsWith('$') && part.endsWith('$')) {
      let inner = part;
      // Chuẩn hóa dấu phẩy thập phân Việt Nam trong số: e.g. 0.8 -> 0{,}8 hoặc giữ nguyên
      inner = inner
        .replace(/≥/g, '\\ge ')
        .replace(/≤/g, '\\le ')
        .replace(/≠/g, '\\ne ')
        .replace(/±/g, '\\pm ')
        .replace(/·/g, '\\cdot ')
        .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
        .replace(/√([a-zA-Z0-9]+)/g, '\\sqrt{$1}')
        .replace(/²/g, '^2')
        .replace(/³/g, '^3');
      return inner;
    }

    // Với phần văn bản thường (chưa có $), tìm và bọc các công thức toán
    let p = part;

    // 1. Chuyển các căn thức như √(2x - 6) -> $\sqrt{2x - 6}$
    p = p.replace(/√\(([^)]+)\)/g, '$\\sqrt{$1}$');
    p = p.replace(/√([a-zA-Z0-9]+)/g, '$\\sqrt{$1}$');

    // 2. Chuyển các hệ phương trình dạng { ax + by = c, dx + ey = f }
    p = p.replace(/\{\s*([^,{}]+)\s*,\s*([^,{}]+)\s*\}/g, '$\\begin{cases} $1 \\\\ $2 \\end{cases}$');

    // 3. Chuyển các phương trình đường thẳng: (d): y = ax + b -> $(d)\\colon y = ax + b$
    p = p.replace(/\((d|d'|d1|d2)\)\s*:\s*y\s*=\s*([^,.\n]+)/g, '($1)$\\colon y = $2$');

    // 4. Chuyển các lũy thừa: x² -> $x^2$, y³ -> $y^3$, AH² -> $AH^2$, etc.
    p = p.replace(/([a-zA-Z0-9)]+)²/g, '$$1^2$');
    p = p.replace(/([a-zA-Z0-9)]+)³/g, '$$1^3$');
    p = p.replace(/([a-zA-Z0-9)]+)⁴/g, '$$1^4$');

    // 5. Chuyển các quan hệ bất đẳng thức / phương trình:
    // e.g. "x ≥ 3", "x > 3", "x ≤ -2", "x ≠ 1", "m = 3"
    p = p.replace(/\b([a-zA-Z])\s*([≥≤≠><=])\s*(-?\d+(\/\d+)?)\b/g, '$$1 $2 $3$');
    p = p.replace(/≥/g, '\\ge ');
    p = p.replace(/≤/g, '\\le ');
    p = p.replace(/≠/g, '\\ne ');
    p = p.replace(/±/g, '\\pm ');
    p = p.replace(/·/g, '\\cdot ');
    p = p.replace(/∈\s*ℝ/g, '\\in \\mathbb{R}');
    p = p.replace(/∈/g, '\\in ');
    p = p.replace(/ℝ/g, '\\mathbb{R}');
    p = p.replace(/⊥/g, '\\perp ');
    p = p.replace(/\s\/\/\s/g, ' \\parallel ');
    p = p.replace(/∠([A-Z]{3}|[A-Z])/g, '$\\widehat{$1}$');

    return p;
  });

  let result = processedParts.join('');

  // Làm sạch các trường hợp bọc thừa $$ hoặc $$ lồng nhau
  result = cleanLatexDelimiters(result);

  return result;
}

/**
 * Làm sạch và sửa các lỗi phân định dấu $ (tránh $$$ hoặc $ $ rỗng)
 */
export function cleanLatexDelimiters(input: string): string {
  if (!input) return '';
  let str = input;

  // Hợp nhất các cặp liền kề: $a$ $b$ hoặc $$...$$
  str = str.replace(/\$\s*\$/g, '');
  str = str.replace(/\${3,}/g, '$$');

  return str;
}

/**
 * Chuẩn hóa toàn bộ câu hỏi đề thi về dạng LaTeX
 */
export function formatQuestionLatex(q: ExamQuestion): ExamQuestion {
  return {
    ...q,
    prompt: normalizeToLatex(q.prompt),
    options: q.options?.map((opt) => ({
      ...opt,
      text: normalizeToLatex(opt.text),
    })),
    tfStatements: q.tfStatements?.map((st) => ({
      ...st,
      text: normalizeToLatex(st.text),
      explanation: st.explanation ? normalizeToLatex(st.explanation) : st.explanation,
    })),
    shortAnswerText: q.shortAnswerText ? normalizeToLatex(q.shortAnswerText) : q.shortAnswerText,
    essayGradingSteps: q.essayGradingSteps?.map((step) => ({
      ...step,
      step: normalizeToLatex(step.step),
    })),
    solutionExplanation: q.solutionExplanation ? normalizeToLatex(q.solutionExplanation) : q.solutionExplanation,
    learningObjective: q.learningObjective ? normalizeToLatex(q.learningObjective) : q.learningObjective,
  };
}

/**
 * Chuẩn hóa toàn bộ đề thi về dạng LaTeX
 */
export function formatPaperLatex(paper: ExamPaper): ExamPaper {
  return {
    ...paper,
    questions: paper.questions.map(formatQuestionLatex),
  };
}

/**
 * Parse chuỗi văn bản chứa cả chữ và công thức LaTeX ($...$ hoặc $$...$$) thành các phần tử HTML render qua KaTeX
 */
export function renderLatexToHtml(content: string): string {
  if (!content) return '';

  // Tách văn bản thành các đoạn thường và các đoạn công thức $...$ hoặc $$...$$
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  const parts = content.split(mathRegex);

  return parts
    .map((part) => {
      if (!part) return '';

      // Block math: $$ ... $$
      if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
        const formula = part.slice(2, -2).trim();
        try {
          return `<div class="katex-display-wrapper my-1 overflow-x-auto">${katex.renderToString(formula, {
            displayMode: true,
            throwOnError: false,
          })}</div>`;
        } catch {
          return `<span class="text-rose-600 font-mono">${escapeHtml(part)}</span>`;
        }
      }

      // Inline math: $ ... $
      if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
        const formula = part.slice(1, -1).trim();
        try {
          return katex.renderToString(formula, {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          return `<span class="text-rose-600 font-mono">${escapeHtml(part)}</span>`;
        }
      }

      // Văn bản thông thường (xử lý xuống dòng)
      return escapeHtml(part).replace(/\n/g, '<br />');
    })
    .join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Component React hiển thị nội dung chứa công thức LaTeX
 */
export const LatexRenderer: React.FC<{
  text: string;
  className?: string;
  showRawLatex?: boolean;
}> = ({ text, className = '', showRawLatex = false }) => {
  if (!text) return null;

  if (showRawLatex) {
    return (
      <span className={`font-mono text-indigo-700 bg-indigo-50/70 px-1.5 py-0.5 rounded text-xs select-all ${className}`}>
        {text}
      </span>
    );
  }

  const html = renderLatexToHtml(text);
  return (
    <span
      className={`katex-rendered-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
