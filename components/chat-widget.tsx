'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'bot'
  text: string
  options?: { label: string; value: string }[]
}

const FAQ_RESPONSES: Record<string, string> = {
  shipping: `🚚 **Shipping Information:**
• **Nairobi**: 2-hour delivery
• **Nationwide**: Next-day dispatch
• **Free shipping** on orders over KES 5,000`,
  
  payment: `💳 **Payment Options:**
• **M-PESA** (recommended)
• **Cash on Delivery** (Nairobi only)
• **Bank Transfer**

All payments are secure and encrypted.`,
  
  returns: `🔄 **Returns & Refunds:**
• **7-day** return policy
• Items must be in original condition
• Contact us to initiate a return
• Refunds processed within 5 business days`,
  
  warranty: `🛡️ **Warranty:**
• All products come with **manufacturer warranty**
• Phones: 1-2 years depending on brand
• Accessories: 6-12 months
• We handle all warranty claims`,
  
  contact: `📞 **Contact Us:**
• **WhatsApp**: +254 700 000 000
• **Phone**: +254 700 000 000
• **Email**: support@mobdeals.co.ke
• **Visit**: Moi Avenue, Tembo House Cooperative`,
  
  discount: `🎁 **Get 5% Off!**
Enter your phone number and we'll send you a discount code via SMS.`,
}

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  type: 'bot',
  text: `👋 **Welcome to MobDeals!**

How can I help you today?`,
  options: [
    { label: '🚚 Shipping', value: 'shipping' },
    { label: '💳 Payment', value: 'payment' },
    { label: '🔄 Returns', value: 'returns' },
    { label: '🛡️ Warranty', value: 'warranty' },
    { label: '📞 Contact', value: 'contact' },
    { label: '🎁 Get Discount', value: 'discount' },
  ],
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleOptionClick = (value: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: value,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      setIsTyping(false)
      
      if (value === 'discount') {
        setShowLeadCapture(true)
      }

      const response = FAQ_RESPONSES[value] || `I'm not sure about that. Would you like to speak with a human agent on WhatsApp?`
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response,
        options: value === 'discount' ? undefined : [
          { label: 'Speak to Human', value: 'human' },
          { label: 'More Questions', value: 'more' },
        ],
      }
      setMessages((prev) => [...prev, botMessage])
    }, 800)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    handleOptionClick(inputValue.toLowerCase())
    setInputValue('')
  }

  const handleLeadSubmit = (phone: string) => {
    // Store phone with consent (in production, save to database)
    console.log('Lead captured:', phone)
    
    const botMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      text: `✅ Thank you! We've sent a 5% discount code to **${phone}**. Check your SMS!`,
      options: [
        { label: 'More Questions', value: 'more' },
        { label: 'Speak to Human', value: 'human' },
      ],
    }
    setMessages((prev) => [...prev, botMessage])
    setShowLeadCapture(false)
  }

  const openWhatsApp = () => {
    window.open('https://wa.me/254700000000?text=Hi%20MobDeals%2C%20I%20need%20assistance', '_blank')
  }

  return (
    <>
      {/* Chat Launcher */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110',
          isOpen ? 'bg-muted-foreground' : 'bg-mobdeals-red'
        )}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl chat-widget-enter">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-mobdeals-red p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">MobDeals Support</h3>
                <p className="text-xs text-white/80">Typically replies instantly</p>
              </div>
            </div>
            <button
              onClick={openWhatsApp}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 transition-colors hover:bg-green-600"
              title="Chat on WhatsApp"
            >
              <Phone className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.type === 'user'
                      ? 'bg-mobdeals-red text-white'
                      : 'bg-secondary text-foreground'
                  )}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  
                  {message.options && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleOptionClick(option.value)}
                          className="rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-background"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Lead Capture Form */}
            {showLeadCapture && (
              <div className="rounded-xl bg-secondary p-4">
                <p className="mb-3 text-sm">Enter your phone number:</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const phone = (e.target as HTMLFormElement).phone.value
                    if (phone) handleLeadSubmit(phone)
                  }}
                >
                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g., 0700000000"
                    pattern="0[0-9]{9}"
                    required
                    className="mb-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <label className="mb-3 flex items-start gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" required className="mt-0.5" />
                    <span>I consent to receive marketing messages</span>
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-mobdeals-red py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    Get Discount Code
                  </button>
                </form>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border p-4"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 rounded-full border border-border bg-secondary px-4 py-2 text-sm focus:border-mobdeals-red focus:outline-none focus:ring-1 focus:ring-mobdeals-red"
            />
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-mobdeals-red text-white transition-colors hover:bg-red-700"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="rounded-b-2xl border-t border-border bg-muted/50 px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">
              Powered by MobDeals AI •{' '}
              <button onClick={openWhatsApp} className="text-mobdeals-red hover:underline">
                Chat on WhatsApp
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  )
}
