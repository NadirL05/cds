"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Bot, MessageCircle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat(
    {
      api: "/api/chat",
    }
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full",
          "bg-orange-500 text-white shadow-lg shadow-orange-500/40",
          "hover:bg-orange-400 transition-colors"
        )}
        aria-label="Ouvrir le coach IA"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 flex w-80 sm:w-96 flex-col rounded-2xl border border-zinc-800 bg-zinc-950/90 shadow-2xl backdrop-blur-xl max-h-[calc(100vh-6rem)]">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-100">
                  Coach IA CDS
                </span>
                <span className="text-[11px] text-zinc-400">
                  Pose-moi tes questions sport & nutrition
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
              aria-label="Fermer le coach IA"
              title="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm min-h-0">
            {messages.length === 0 && (
              <div className="rounded-lg bg-zinc-900/80 px-3 py-2 text-xs text-zinc-400">
                Tu peux par exemple demander:
                <ul className="mt-1 list-disc pl-4">
                  <li>« Quel plan d&apos;entraînement pour cette semaine ? »</li>
                  <li>« Comment adapter mon alimentation à mon objectif ? »</li>
                </ul>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-xs",
                    m.role === "user"
                      ? "bg-[#ff5500] text-white rounded-br-sm"
                      : "bg-zinc-800 text-white rounded-bl-sm"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Le coach réfléchit...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t border-zinc-800 bg-zinc-950/80 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Pose ta question au coach..."
                value={input}
                onChange={handleInputChange}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-8 w-8 rounded-full bg-orange-500 hover:bg-orange-400"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

