import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
    content: string;
    className?: string;
}

export default function MarkdownMessage({ content, className = "" }: MarkdownMessageProps) {
    return (
        <div className={`markdown-message ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom renderers for better styling
                    h1: ({ children }) => (
                        <h1 className="text-lg font-bold mb-3 mt-2 text-inherit">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-base font-semibold mb-2 mt-3 text-inherit">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-sm font-semibold mb-2 mt-2 text-inherit">{children}</h3>
                    ),
                    p: ({ children }) => (
                        <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="ml-1">{children}</li>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),
                    code: ({ children, className }) => {
                        // Check if it's an inline code by looking at the className (react-markdown adds language-xxx for code blocks)
                        const isInline = !className;
                        if (isInline) {
                            return (
                                <code className="px-1.5 py-0.5 bg-slate-200/50 rounded text-xs font-mono">
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <pre className="bg-slate-100 rounded-lg p-3 my-2 overflow-x-auto">
                                <code className={`text-xs font-mono text-slate-800 ${className || ""}`}>{children}</code>
                            </pre>
                        );
                    },
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-3 border-emerald-400 pl-3 my-2 italic bg-emerald-50/50 py-1">
                            {children}
                        </blockquote>
                    ),
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800 underline"
                        >
                            {children}
                        </a>
                    ),
                    hr: () => <hr className="my-3 border-t border-gray-300" />,
                    br: () => <br className="block mb-2" />,
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-2">
                            <table className="min-w-full text-xs border-collapse">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-slate-100">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-slate-200">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-slate-50">{children}</tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-3 py-2 text-left font-semibold text-slate-700 border-b border-slate-300">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-3 py-2 text-slate-600 border-b border-slate-200">{children}</td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
