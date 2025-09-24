import React, { useRef, useEffect } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "Enter product description..." }) => {
    const editorRef = useRef(null);
    const toolbarRef = useRef(null);

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const handleInput = () => {
        if (onChange) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current.focus();
        handleInput();
    };

    const insertHTML = (html) => {
        document.execCommand('insertHTML', false, html);
        handleInput();
    };

    return (
        <div className="border border-gray-300 rounded-lg">
            {/* Toolbar */}
            <div ref={toolbarRef} className="bg-gray-100 p-2 border-b border-gray-300 flex flex-wrap gap-1">
                {/* Font Style */}
                <select
                    onChange={(e) => execCommand('fontName', e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                </select>

                <select
                    onChange={(e) => execCommand('fontSize', e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                >
                    <option value="1">Small</option>
                    <option value="3">Normal</option>
                    <option value="5">Large</option>
                    <option value="7">Huge</option>
                </select>

                {/* Text Formatting */}
                <button onClick={() => execCommand('bold')} className="px-3 py-1 border rounded font-bold">B</button>
                <button onClick={() => execCommand('italic')} className="px-3 py-1 border rounded italic">I</button>
                <button onClick={() => execCommand('underline')} className="px-3 py-1 border rounded underline">U</button>

                {/* Alignment */}
                <button onClick={() => execCommand('justifyLeft')} className="px-3 py-1 border rounded">⬅</button>
                <button onClick={() => execCommand('justifyCenter')} className="px-3 py-1 border rounded">⨀</button>
                <button onClick={() => execCommand('justifyRight')} className="px-3 py-1 border rounded">➡</button>

                {/* Lists */}
                <button onClick={() => execCommand('insertUnorderedList')} className="px-3 py-1 border rounded">• List</button>
                <button onClick={() => execCommand('insertOrderedList')} className="px-3 py-1 border rounded">1. List</button>

                {/* Indent */}
                <button onClick={() => execCommand('outdent')} className="px-3 py-1 border rounded">←</button>
                <button onClick={() => execCommand('indent')} className="px-3 py-1 border rounded">→</button>

                {/* Links */}
                <button onClick={() => {
                    const url = prompt('Enter URL:');
                    if (url) execCommand('createLink', url);
                }} className="px-3 py-1 border rounded">🔗</button>
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="min-h-[200px] p-4 focus:outline-none"
                placeholder={placeholder}
                style={{
                    lineHeight: '1.6',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px'
                }}
            />
        </div>
    );
};

export default RichTextEditor;