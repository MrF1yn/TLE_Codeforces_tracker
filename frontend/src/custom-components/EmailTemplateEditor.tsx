import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Save, Loader2, Code, Eye } from 'lucide-react';

// Types
interface EmailTemplate {
    subject: string;
    body: string;
}

interface EmailTemplateEditorProps {
    emailTemplate: EmailTemplate;
    setEmailTemplate: (template: EmailTemplate) => void;
    saveEmailTemplate: () => void;
    isSaving?: boolean;
}

// Simple HTML detection function
const isHtmlContent = (content: string): boolean => {
    const htmlTags = /<\/?[a-z][\s\S]*>/i;
    const htmlEntities = /&[a-zA-Z][a-zA-Z0-9]*;/;
    return htmlTags.test(content) || htmlEntities.test(content);
};

// Monaco Editor Component
const MonacoEditor: React.FC<{
    value: string;
    onChange: (value: string) => void;
    language: string;
    height?: string;
}> = ({ value, onChange, language, height = '500px' }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const monacoRef = useRef<any>(null);
    const editorInstanceRef = useRef<any>(null);
    const [editorTheme, setEditorTheme] = useState<string>('vs-dark');
    useEffect(() => {
        const updateTheme = () => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            setEditorTheme(isDarkMode ? 'vs-dark' : 'vs-light');

            // Update theme if editor already exists
            if (editorInstanceRef.current && monacoRef.current) {
                monacoRef.current.editor.setTheme(isDarkMode ? 'vs-dark' : 'vs-light');
            }
        };

        // Initial theme detection
        updateTheme();

        // Set up observer to detect theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    updateTheme();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        const loadMonaco = async () => {
            if (typeof window !== 'undefined' && !monacoRef.current) {
                // Load Monaco Editor from CDN
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
                script.onload = () => {
                    (window as any).require.config({
                        paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }
                    });

                    (window as any).require(['vs/editor/editor.main'], () => {
                        monacoRef.current = (window as any).monaco;
                        initializeEditor();
                    });
                };
                document.head.appendChild(script);
            } else if (monacoRef.current && editorRef.current) {
                initializeEditor();
            }
        };

        const initializeEditor = () => {
            if (editorRef.current && monacoRef.current && !editorInstanceRef.current) {

                editorInstanceRef.current = monacoRef.current.editor.create(editorRef.current, {
                    value: value,
                    language: language,
                    theme: editorTheme,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible'
                    },
                    folding: true,
                    wordWrap: 'on'
                });

                editorInstanceRef.current.onDidChangeModelContent(() => {
                    const currentValue = editorInstanceRef.current.getValue();
                    onChange(currentValue);
                });
            }
        };

        loadMonaco();

        return () => {
            if (editorInstanceRef.current) {
                editorInstanceRef.current.dispose();
                editorInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (editorInstanceRef.current && editorInstanceRef.current.getValue() !== value) {
            editorInstanceRef.current.setValue(value);
        }
    }, [value]);

    useEffect(() => {
        if (editorInstanceRef.current && monacoRef.current) {
            monacoRef.current.editor.setModelLanguage(
                editorInstanceRef.current.getModel(),
                language
            );
        }
    }, [language]);

    return (
        <div
            ref={editorRef}
            style={{ height, border: '1px solid var(--border)', borderRadius: '6px' }}
            className="overflow-hidden"
        />
    );
};

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
                                                                     emailTemplate,
                                                                     setEmailTemplate,
                                                                     saveEmailTemplate,
                                                                     isSaving = false
                                                                 }) => {
    const [isHtmlDetected, setIsHtmlDetected] = useState(false);

    useEffect(() => {
        setIsHtmlDetected(isHtmlContent(emailTemplate.body));
    }, [emailTemplate.body]);

    const handleBodyChange = (value: string) => {
        setEmailTemplate({ ...emailTemplate, body: value });
    };

    return (
        <div className="bg-secondary/10 dark:bg-card/30 rounded-lg shadow-xl border border-border  p-6">
            <div className="flex items-center justify-between mb-6 gap-2">
                <div className="flex items-center  space-x-3">
                    <Mail className="w-6 h-6"/>
                    <h2 className="text-md md:text-xl font-semibold text-gray-900 dark:text-white">Email Template</h2>
                </div>
                {/* Preview Button */}
                {isHtmlDetected && emailTemplate.body && (
                    <div className="flex justify-end ml-auto">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    <span className={"hidden md:block"}>Preview HTML</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                                <DialogHeader>
                                    <DialogTitle className="text-gray-900 dark:text-gray-50">Email HTML Preview</DialogTitle>
                                    <DialogDescription className={"text-gray-900 dark:text-gray-50"}>
                                        Preview of how your HTML email template will render
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4 bg-card rounded-lg shadow-xl border border-border dark:border-2 overflow-hidden">
                                    <div className=" px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium dark:text-white text-black">
                                                Subject: {emailTemplate.subject || 'No subject'}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-500">
                                                {emailTemplate.body.length} characters
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className="p-6 max-h-96 overflow-y-auto custom-scrollbar"
                                        dangerouslySetInnerHTML={{ __html: emailTemplate.body }}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
                <Button
                    onClick={saveEmailTemplate}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-transparent md:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                    ) : (
                        <Save className="w-4 h-4 mr-2"/>
                    )}
                    <span className={"hidden md:block"}
                    >Save Template</span>
                </Button>
            </div>

            <div className="space-y-6">
                {/* Subject Field */}
                <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Template Subject
                    </label>
                    <input
                        type="text"
                        value={emailTemplate.subject}
                        onChange={(e) => setEmailTemplate({...emailTemplate, subject: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none dark:bg-secondary  text-gray-900 dark:text-white"
                        placeholder="Enter your email subject here..."
                    />
                </div>

                {/* Body Field with Monaco Editor */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Template Body
                        </label>
                        <div className="flex items-center gap-4">
                            {isHtmlDetected && (
                                <div className="flex items-center text-sm text-primary font-semibold">
                                    <Code className="w-4 h-4 mr-1" />
                                    HTML detected - Syntax highlighting enabled
                                </div>
                            )}
                        </div>
                    </div>

                    <MonacoEditor
                        value={emailTemplate.body}
                        onChange={handleBodyChange}
                        language={isHtmlDetected ? 'html' : 'plaintext'}
                        height="400px"

                    />
                </div>


            </div>
                    <div
                        className="bg-secondary/20 dark:bg-card rounded-lg shadow-xl  border-border  p-4 mt-4">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Available Variables
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm font-semibold">
                            <code
                                className="bg-primary text-white px-2 py-1 rounded w-full break-words">
                                {`{{studentName}}`}
                            </code>
                            <code
                                className="bg-primary text-white px-2 py-1 rounded w-full break-words">
                                {`{{currentRating}}`}
                            </code>
                            <code
                                className="bg-primary text-white px-2 py-1 rounded w-full break-words">
                                {`{{maxRating}}`}
                            </code>
                            <code
                                className="bg-primary text-white px-2 py-1 rounded w-full break-words">
                                {`{{lastActivity}}`}
                            </code>
                            <code
                                className="bg-primary text-white px-2 py-1 rounded w-full break-words">
                                {`{{codeforcesHandle}}`}
                            </code>
                            <code
                                className="bg-primary text-white px-2 py-1 rounded w-full break-words">
                                {`{{email}}`}
                            </code>
                        </div>
                    </div>

            {/*/!* Template Info *!/*/}
            {/*<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">*/}
            {/*    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">*/}
            {/*        Template Summary*/}
            {/*    </h3>*/}
            {/*    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">*/}
            {/*        <div>Subject length: {emailTemplate.subject.length} characters</div>*/}
            {/*        <div>Body length: {emailTemplate.body.length} characters</div>*/}
            {/*        <div>Content type: {isHtmlDetected ? 'HTML' : 'Plain text'}</div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
};

export default EmailTemplateEditor;