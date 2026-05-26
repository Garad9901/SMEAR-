import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
  suggestions?: string[]
  cards?: {
    title: string
    metric: string
    desc: string
    type: 'critical' | 'warning' | 'info' | 'success'
  }[]
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'ai',
    text: 'Hello! I am RouteIQ X Agent Assistant. I have context over all 8 active reasoning agents, your ₹50.0M budget, and 147 road segments. How can I assist you with infrastructure intelligence today?',
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'Which roads are at risk this monsoon?',
      'Show critical budget allocations',
      'What is our current system ROI?'
    ]
  }
]

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSend = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Simulate agent processing and responding
    setTimeout(() => {
      let aiResponseText = ''
      let suggestions: string[] = []
      let cards: Message['cards'] = []

      const normalized = text.toLowerCase()
      if (normalized.includes('monsoon') || normalized.includes('risk') || normalized.includes('rain')) {
        aiResponseText = 'The Climate and Risk Agents have integrated Sentinel-2 imagery with local rainfall predictions. 3 primary segments are under critical stress.'
        cards = [
          { title: 'NH-48 segment 4', metric: 'RHI: 23/100', desc: 'Predicted monsoon washout in 21 days.', type: 'critical' },
          { title: 'Western Express Bypass', metric: 'RHI: 41/100', desc: 'Heavy freight routing increases shear load.', type: 'warning' }
        ]
        suggestions = ['Simulate extreme monsoon', 'Get repair estimates']
      } else if (normalized.includes('budget') || normalized.includes('alloc') || normalized.includes('money') || normalized.includes('spend')) {
        aiResponseText = 'The Budget and Linear Programming agents solved your ₹50.0M maintenance pool. We achieved 32 projects within a ₹47.2M envelope.'
        cards = [
          { title: 'LP Solver Solution', metric: '₹47.2M / ₹50M', desc: 'ROI projected at 3.4x. ₹2.8M preserved in emergency reserve.', type: 'success' }
        ]
        suggestions = ['Show optimization ledger', 'Compare with Delhi budget']
      } else if (normalized.includes('roi') || normalized.includes('performance') || normalized.includes('efficient')) {
        aiResponseText = 'Our system tracks real-time SaaS interventions. Across Pune and Mumbai, the composite infrastructure yield is 3.7x.'
        cards = [
          { title: 'Pune Ring Road Segment', metric: '76/100 RHI', desc: 'Improved from 28 post-intervention. Full verification by Sentinel-2.', type: 'info' }
        ]
        suggestions = ['Run city-wide comparison', 'Inspect GIS audit ledger']
      } else {
        aiResponseText = 'I have queried the agent blackboard. The GIS agent recommends scheduling inspection crews on Pune Bypass. Would you like to review the maintenance plan?'
        suggestions = ['Show critical budget allocations', 'View live agent command terminal']
      }

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        suggestions,
        cards
      }

      setMessages(prev => [...prev, aiMsg])
      setIsTyping(false)
    }, 1000)
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Floating Toggle Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_24px_rgba(99,102,241,0.6)] group"
        >
          <Bot className="w-6 h-6 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
          </span>
        </button>
      )}

      {/* Expanded Chat Widget */}
      {isOpen && (
        <div className="w-[360px] h-[520px] rounded-2xl bg-surface-card border border-surface-border flex flex-col overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] animate-scale-up">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-brand-600/30 to-cyan-500/20 border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  RouteIQ Assistant
                  <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                </h3>
                <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">8 Agents Listening</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/30">
            {messages.map(msg => (
              <div key={msg.id} className={clsx('flex gap-3', msg.sender === 'user' ? 'flex-row-reverse' : '')}>
                <div className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs',
                  msg.sender === 'ai' ? 'bg-brand-600/20 border border-brand-500/30' : 'bg-cyan-600/20 border border-cyan-500/30'
                )}>
                  {msg.sender === 'ai' ? <Bot className="w-4 h-4 text-brand-400" /> : <User className="w-4 h-4 text-cyan-400" />}
                </div>

                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div className={clsx(
                    'p-3 rounded-2xl text-xs leading-relaxed border',
                    msg.sender === 'ai'
                      ? 'bg-surface-card/80 border-surface-border text-slate-300 rounded-tl-none'
                      : 'bg-brand-600/10 border-brand-500/30 text-white rounded-tr-none'
                  )}>
                    {msg.text}
                  </div>

                  {/* Suggestion tags */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {msg.suggestions.map(s => (
                        <button
                          key={s}
                          onClick={() => handleSend(s)}
                          className="px-2 py-1 text-[10px] text-brand-400 hover:text-white bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-full transition-all text-left"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Structured data cards */}
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="space-y-2 mt-1">
                      {msg.cards.map(c => (
                        <div key={c.title} className={clsx(
                          'p-2.5 rounded-xl border flex flex-col gap-1',
                          c.type === 'critical' ? 'bg-rose-500/5 border-rose-500/20' :
                          c.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                          c.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-brand-500/5 border-brand-500/20'
                        )}>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-white leading-tight">{c.title}</span>
                            <span className={clsx(
                              'font-bold px-1.5 py-0.5 rounded text-[9px] uppercase font-mono',
                              c.type === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                              c.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                              c.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-500/20 text-brand-400'
                            )}>
                              {c.metric}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 leading-normal">{c.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-500 to-cyan-500 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-surface-card/85 border border-surface-border text-xs text-slate-300 px-4 py-3 rounded-2xl rounded-tl-none flex flex-col gap-2 min-w-56 shadow-[0_4px_16px_rgba(99,102,241,0.15)] relative overflow-hidden hologram-scan">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin-slow" />
                      Multi-Agent Pipeline
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">Orchestrating...</span>
                  </div>
                  
                  {/* Dynamic scrolling reasoning steps */}
                  <div className="space-y-1.5 text-[10px] text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="pulse-dot w-1.5 h-1.5" />
                      <span className="text-white font-bold">[GIS]</span> ST_DWithin query...
                    </div>
                    <div className="flex items-center gap-2 opacity-80">
                      <span className="pulse-dot-amber w-1.5 h-1.5" />
                      <span className="text-amber-400 font-bold">[Climate]</span> Loading grid precipitation...
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                      <span className="pulse-dot-rose w-1.5 h-1.5" />
                      <span className="text-rose-400 font-bold">[Optimizer]</span> Matrix convergent solve...
                    </div>
                  </div>

                  <div className="w-full bg-surface-border h-1 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full animate-shimmer" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Prompt Input */}
          <div className="p-3 bg-surface-card border-t border-surface-border flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask AI Agents anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
              className="flex-1 bg-surface border border-surface-border rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500/50"
            />
            <button
              onClick={() => handleSend(inputValue)}
              className="w-8 h-8 rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
