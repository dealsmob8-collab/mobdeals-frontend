'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_MESSAGE,
  STORE_LOCATION,
  WHATSAPP_DISPLAY,
} from '@/lib/site'

interface Message {
  id: string
  type: 'user' | 'bot'
  text: string
  options?: { label: string; value: string }[]
}

const FAQ_RESPONSES: Record<string, string> = {
  stock: 'Send the product name and we will confirm stock, condition, and price.',
  price: 'Message us with the item name and we will confirm the latest price.',
  delivery: 'Nairobi delivery can be arranged after stock confirmation. Ask us for the fastest option.',
  payment: 'We support M-PESA. Ask us to confirm payment options for this item.',
  warranty: 'Warranty depends on the item. We will confirm what applies before you order.',
  contact: `WhatsApp ${WHATSAPP_DISPLAY} or visit ${STORE_LOCATION}.`,
}

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  type: 'bot',
  text: 'Hi. Ask about stock, price, delivery, or warranty.',
  options: [
    { label: 'Stock', value: 'stock' },
    { label: 'Price', value: 'price' },
    { label: 'Delivery', value: 'delivery' },
    { label: 'Warranty', value: 'warranty' },
    { label: 'Contact', value: 'contact' },
  ],
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleOptionClick = (value: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: value,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)

      const response = FAQ_RESPONSES[value] || 'Open WhatsApp and we will help with stock, price, and delivery.'

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response,
        options:
          value === 'contact'
            ? undefined
            : [
                { label: 'Stock', value: 'stock' },
                { label: 'WhatsApp', value: 'human' },
              ],
      }
      setMessages((prev) => [...prev, botMessage])
    }, 800)
  }

  const handleTextQuestion = (value: string) => {
    const normalized = value.toLowerCase()

    if (normalized.includes('stock')) return 'stock'
    if (normalized.includes('price') || normalized.includes('cost')) return 'price'
    if (normalized.includes('delivery') || normalized.includes('ship')) return 'delivery'
    if (normalized.includes('warranty')) return 'warranty'
    if (normalized.includes('contact') || normalized.includes('phone') || normalized.includes('number')) return 'contact'

    return 'stock'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    handleOptionClick(handleTextQuestion(inputValue))
    setInputValue('')
  }

  const openWhatsApp = () => {
    window.open(buildWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE), '_blank')
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
                <p className="text-xs text-white/80">Stock, price, and delivery help</p>
              </div>
            </div>
            <button
              onClick={openWhatsApp}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-mobdeals-cyanDark transition-colors hover:bg-mobdeals-teal"
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
              className="flex h-10 w-10 items-center justify-center rounded-full bg-mobdeals-red text-white transition-colors hover:bg-mobdeals-orangeDark"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="rounded-b-2xl border-t border-border bg-muted/50 px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">
              Need a faster reply?{' '}
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
