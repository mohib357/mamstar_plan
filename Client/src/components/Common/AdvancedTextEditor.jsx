import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';

const AdvancedTextEditor = ({ value, onChange, height = '42px', compact = false }) => {
    const editorRef = useRef(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [videoWidth, setVideoWidth] = useState('560');
    const [videoHeight, setVideoHeight] = useState('315');
    const [isCodeView, setIsCodeView] = useState(false);
    const [htmlContent, setHtmlContent] = useState(value || '');

    // শুধু একটি effect ব্যবহার করুন
    useLayoutEffect(() => {
        if (isCodeView) return;

        if (editorRef.current) {
            const savedRange = saveSelection();

            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }

            restoreSelection(savedRange);
            adjustHeight();
        }
    }, [value, isCodeView]);

    // লেখা অনুযায়ী এডিটরের উচ্চতা অটো-অ্যাডজাস্ট করার ফাংশন
    const adjustHeight = () => {
        if (editorRef.current && !isCodeView) {
            editorRef.current.style.height = 'auto';
            const scrollHeight = editorRef.current.scrollHeight;
            const minHeight = parseInt(height, 10);
            editorRef.current.style.height = `${Math.max(scrollHeight, minHeight)}px`;
        }
    };

    const handleInput = () => {
        if (onChange && editorRef.current) {
            onChange(editorRef.current.innerHTML);
            adjustHeight();
        }
    };

    const handleCodeChange = (e) => {
        const content = e.target.value;
        setHtmlContent(content);
        if (onChange) {
            onChange(content);
        }
    };

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            return selection.getRangeAt(0).cloneRange();
        }
        return null;
    };

    const restoreSelection = (range) => {
        if (range) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    // স্টাইল প্রয়োগ করার জন্য উন্নত ফাংশন
    const execCommand = (command, value = null) => {
        if (isCodeView || !editorRef.current) return;

        const savedRange = saveSelection();
        editorRef.current.focus();

        try {
            document.execCommand(command, false, value);
        } catch (error) {
            console.warn(`Command ${command} failed:`, error);
        }

        restoreSelection(savedRange);
        handleInput();
    };

    const toggleLink = () => {
        if (document.queryCommandState?.('createLink')) {
            execCommand('unlink');
        } else {
            setShowLinkModal(true);
        }
    };

    const insertLink = () => {
        if (!linkUrl) {
            setShowLinkModal(false);
            return;
        }

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (!range.collapsed) {
                execCommand('createLink', linkUrl);
            } else {
                // যদি কিছু select না থাকে
                const anchor = document.createElement('a');
                anchor.href = linkUrl;
                anchor.target = "_blank";
                anchor.textContent = linkUrl;
                range.insertNode(anchor);

                // selection পুনঃস্থাপন
                range.setStartAfter(anchor);
                range.setEndAfter(anchor);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        setShowLinkModal(false);
        setLinkUrl('');
        handleInput();
    };

    const insertImage = () => {
        if (imageUrl) {
            const img = `<img src="${imageUrl}" alt="${imageAlt || 'Image'}" style="max-width: 100%; height: auto; direction: ltr; text-align: left;" />`;
            execCommand('insertHTML', img);
        }
        setShowImageModal(false);
        setImageUrl('');
        setImageAlt('');
    };

    const insertVideo = () => {
        if (videoUrl) {
            const video = `<div class="video-container" style="direction: ltr; text-align: left;"><iframe src="${videoUrl}" width="${videoWidth}" height="${videoHeight}" frameborder="0" allowfullscreen></iframe></div>`;
            execCommand('insertHTML', video);
        }
        setShowVideoModal(false);
        setVideoUrl('');
        setVideoWidth('560');
        setVideoHeight('315');
    };

    const toggleCodeView = () => {
        if (!isCodeView) {
            setHtmlContent(editorRef.current?.innerHTML || '');
        } else {
            if (onChange) {
                onChange(htmlContent);
            }
        }
        setIsCodeView(!isCodeView);
    };

    const ToolbarButton = ({ onClick, children, title, active = false, disabled = false }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            disabled={disabled || isCodeView}
            className={`px-2 py-1 border border-gray-300 rounded text-xs font-medium ${active
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                } ${compact ? 'text-xs px-1 py-1' : 'text-xs px-2 py-1'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="border border-gray-300 rounded-lg" style={{ direction: 'ltr' }}>
            {/* Advanced Toolbar */}
            <div className={`bg-gray-100 p-2 border-b border-gray-300 flex flex-wrap gap-1 ${compact ? 'p-1' : 'p-2'}`}>
                {/* Format Blocks */}
                <select
                    onChange={(e) => execCommand('formatBlock', e.target.value)}
                    className={`px-1 py-1 border rounded text-xs bg-white ${compact ? 'text-xs px-1 py-1' : 'text-xs px-1 py-1'}`}
                    title="Format"
                    disabled={isCodeView}
                >
                    <option value="p">Paragraph</option>
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                    <option value="h4">H4</option>
                    <option value="h5">H5</option>
                    <option value="h6">H6</option>
                    <option value="blockquote">Quote</option>
                </select>

                {/* Font Size */}
                <select
                    onChange={(e) => execCommand('fontSize', e.target.value)}
                    className={`px-1 py-1 border rounded text-xs bg-white ${compact ? 'text-xs px-1 py-1' : 'text-xs px-1 py-1'}`}
                    title="Font Size"
                    disabled={isCodeView}
                >
                    <option value="1">XS</option>
                    <option value="2">S</option>
                    <option value="3">M</option>
                    <option value="4">L</option>
                    <option value="5">XL</option>
                    <option value="6">XXL</option>
                    <option value="7">XXXL</option>
                </select>

                {/* Text Formatting */}
                <div className="flex border rounded overflow-hidden">
                    <ToolbarButton
                        onClick={() => execCommand('bold')}
                        title="Bold"
                        active={document.queryCommandState?.('bold')}
                    >
                        <span className="font-bold">B</span>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => execCommand('italic')}
                        title="Italic"
                        active={document.queryCommandState?.('italic')}
                    >
                        <span className="italic">I</span>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => execCommand('underline')}
                        title="Underline"
                        active={document.queryCommandState?.('underline')}
                    >
                        <span className="underline">U</span>
                    </ToolbarButton>
                </div>

                {/* Text Color */}
                <div className="flex border rounded overflow-hidden">
                    <ToolbarButton onClick={() => execCommand('foreColor', '#000000')} title="Text Color">
                        <div className="w-3 h-3 border bg-black"></div>
                    </ToolbarButton>
                    <input
                        type="color"
                        onChange={(e) => execCommand('foreColor', e.target.value)}
                        className="w-6 h-6 border-0"
                        title="Custom Color"
                        disabled={isCodeView}
                    />
                </div>

                {/* Background Color */}
                <div className="flex border rounded overflow-hidden">
                    <ToolbarButton onClick={() => execCommand('backColor', '#ffffff')} title="Background Color">
                        <div className="w-3 h-3 border bg-white"></div>
                    </ToolbarButton>
                    <input
                        type="color"
                        onChange={(e) => execCommand('backColor', e.target.value)}
                        className="w-6 h-6 border-0"
                        title="Custom Background"
                        disabled={isCodeView}
                    />
                </div>

                {/* Alignment */}
                <div className="flex border rounded overflow-hidden">
                    <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">⬅</ToolbarButton>
                    <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">⨀</ToolbarButton>
                    <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">➡</ToolbarButton>
                </div>

                {/* Lists */}
                <div className="flex border rounded overflow-hidden">
                    <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">•</ToolbarButton>
                    <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">1.</ToolbarButton>
                </div>

                {/* Media */}
                <div className="flex border rounded overflow-hidden">
                    <ToolbarButton onClick={toggleLink} title="Insert Link">🔗</ToolbarButton>
                    <ToolbarButton onClick={() => setShowImageModal(true)} title="Insert Image">🖼️</ToolbarButton>
                    <ToolbarButton onClick={() => setShowVideoModal(true)} title="Insert Video">🎥</ToolbarButton>
                </div>

                {/* Special Actions */}
                <div className="flex border rounded overflow-hidden">
                    <ToolbarButton onClick={() => execCommand('removeFormat')} title="Clear Formatting">🧹</ToolbarButton>
                    <ToolbarButton onClick={() => execCommand('undo')} title="Undo">↶</ToolbarButton>
                    <ToolbarButton onClick={() => execCommand('redo')} title="Redo">↷</ToolbarButton>
                </div>

                {/* Code View */}
                <ToolbarButton onClick={toggleCodeView} title={isCodeView ? "Visual Editor" : "Code View"}>
                    {isCodeView ? '📝' : '</>'}
                </ToolbarButton>
            </div>

            {/* Editor Area */}
            {isCodeView ? (
                <textarea
                    value={htmlContent}
                    onChange={handleCodeChange}
                    style={{ minHeight: height, resize: 'vertical' }}
                    className="w-full p-2 focus:outline-none font-mono text-xs bg-gray-50 border-0"
                    placeholder="Enter HTML code here..."
                />
            ) : (
                <div
                    ref={editorRef}
                    contentEditable
                    dir="ltr"
                    onInput={handleInput}
                    style={{ minHeight: height, resize: 'vertical' }}
                    className="w-full p-2 focus:outline-none overflow-auto bg-white font-sans text-gray-900 leading-relaxed border-0 text-sm"
                    data-placeholder="Start typing your content here..."
                    onKeyDown={(e) => {
                        // Prevent default behavior that might break selection
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            execCommand('insertParagraph');
                        }
                    }}
                    // Force LTR direction for all child elements
                    onMouseDown={(e) => {
                        // Ensure LTR direction when clicking inside the editor
                        if (editorRef.current) {
                            editorRef.current.style.direction = 'ltr';
                            editorRef.current.style.textAlign = 'left';
                            editorRef.current.style.unicodeBidi = 'plaintext';
                        }
                    }}
                />
            )}

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg w-80" style={{ direction: 'ltr' }}>
                        <h3 className="text-lg font-semibold mb-3">Insert Link</h3>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                            style={{ direction: 'ltr' }}
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowLinkModal(false)} className="px-3 py-1 border rounded text-sm">Cancel</button>
                            <button onClick={insertLink} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Insert</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg w-80" style={{ direction: 'ltr' }}>
                        <h3 className="text-lg font-semibold mb-3">Insert Image</h3>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                            style={{ direction: 'ltr' }}
                        />
                        <input
                            type="text"
                            value={imageAlt}
                            onChange={(e) => setImageAlt(e.target.value)}
                            placeholder="Alt text"
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowImageModal(false)} className="px-3 py-1 border rounded text-sm">Cancel</button>
                            <button onClick={insertImage} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Insert</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Modal */}
            {showVideoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg w-80" style={{ direction: 'ltr' }}>
                        <h3 className="text-lg font-semibold mb-3">Insert Video</h3>
                        <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://youtube.com/embed/example"
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                            style={{ direction: 'ltr' }}
                        />
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Width</label>
                                <input
                                    type="number"
                                    value={videoWidth}
                                    onChange={(e) => setVideoWidth(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Height</label>
                                <input
                                    type="number"
                                    value={videoHeight}
                                    onChange={(e) => setVideoHeight(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowVideoModal(false)} className="px-3 py-1 border rounded text-sm">Cancel</button>
                            <button onClick={insertVideo} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Insert</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedTextEditor;