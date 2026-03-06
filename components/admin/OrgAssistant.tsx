'use client'

import { useState } from 'react'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function OrgAssistant({ orgId }: { orgId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your Parvah Assistant. How can I help you with your organization data today?' }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsLoading(true)

        try {
            const token = localStorage.getItem('parvah_admin_token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orgId, message: userMsg })
            })

            const data = await response.json()
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that request." }])
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to service." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            {isOpen ? (
                <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 w-[380px] h-[520px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#201F47] to-[#1b1a3e] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-[15px] font-normal text-white">Parvah Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-[11px] text-gray-400">Context-Aware AI</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar-chat">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-[18px] px-4 py-2.5 text-[13px] font-normal leading-relaxed ${m.role === 'user' ? 'bg-[#576CDB] text-white rounded-br-none' : 'bg-gray-100 text-[#201F47] rounded-bl-none'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-[18px] rounded-bl-none px-4 py-3 flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1 pr-1.5 shadow-sm">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about your organization..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] px-3 py-2 outline-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${!input.trim() || isLoading ? 'bg-gray-100 text-gray-400' : 'bg-[#201F47] text-white hover:bg-[#14122d]'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-[#201F47] text-white rounded-[20px] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
                >
                    <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F25A5A] rounded-full border-2 border-[#F9F9FB]" />
                </button>
            )}

            <style jsx>{`
                .custom-scrollbar-chat::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar-chat::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-chat::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 4px;
                }
            `}</style>
        </div>
    )
}
