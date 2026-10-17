"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Flame } from "lucide-react";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

/** Avatar Vira - gradient dengan logo viral */
function ViraAvatar({ size = "md", pulse = false }: { size?: "sm" | "md" | "lg"; pulse?: boolean }) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };
  const iconSizes = { sm: "h-3.5 w-3.5", md: "h-4.5 w-4.5", lg: "h-5 w-5" };
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-brand shadow-glow",
        sizes[size]
      )}
    >
      <Flame className={cn("text-white", iconSizes[size])} />
      {pulse && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-success" />
      )}
    </span>
  );
}

const quickPrompts = [
  "Produk apa yang viral minggu ini?",
  "Macam nak jana link afiliasi?",
  "Berapa komisen yang saya dapat?",
  "Cara tarik wang ke bank?",
];

/** Renderer Markdown ringkas untuk balasan AI (termasuk jadual GFM). */
function MarkdownMessage({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-1.5 whitespace-pre-wrap last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-semibold text-secondary">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => (
          <ul className="mb-1.5 list-disc space-y-0.5 pl-4 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-1.5 list-decimal space-y-0.5 pl-4 last:mb-0">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline"
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="rounded bg-black/5 px-1 py-0.5 text-[0.85em]">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="my-1.5 overflow-x-auto rounded-lg bg-black/5 p-2 text-xs">{children}</pre>
        ),
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto">
            <table className="w-full border-collapse text-xs">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-gray-200 bg-black/5 px-2 py-1 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-200 px-2 py-1 align-top">{children}</td>
        ),
        h1: ({ children }) => <p className="mb-1 font-heading font-bold">{children}</p>,
        h2: ({ children }) => <p className="mb-1 font-heading font-bold">{children}</p>,
        h3: ({ children }) => <p className="mb-1 font-semibold">{children}</p>,
        blockquote: ({ children }) => (
          <blockquote className="my-1.5 border-l-2 border-primary/40 pl-3 text-gray-600">
            {children}
          </blockquote>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hai! 👋 Saya **Vira**, pembantu AI BarangViral. Saya boleh bantu anda cari produk viral, jelaskan komisen afiliasi, atau bimbing jana link promosi. Apa yang boleh saya tolong?",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on close
  useEffect(() => {
    return () => stopStreaming();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentResponse, streaming]);

  const stopStreaming = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.cancel();
      streamRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreaming(false);
    setCurrentResponse("");
  }, []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setStreaming(true);
    setCurrentResponse("");

    let buffer = "";
    try {
      abortControllerRef.current = new AbortController();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context: "buyer" }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok || !res.body) {
        let errMsg = "Maaf, AI sedang rehat. Sila cuba lagi.";
        try {
          const data = await res.json();
          if (data?.error) errMsg = data.error;
        } catch {
          /* abaikan */
        }
        throw new Error(errMsg);
      }

      const reader = res.body.getReader();
      streamRef.current = reader;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setCurrentResponse(buffer);
      }
      buffer += decoder.decode();
      setCurrentResponse(buffer);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return; // user tutup chat — abaikan
      }
      console.error("[Chat Error]", error);
      const msg =
        error instanceof Error && error.message !== "Failed to fetch stream"
          ? error.message
          : "Sambungan bermasalah. Sila cuba lagi.";
      setMessages((m) => [...m, { role: "assistant", content: msg }]);
      return;
    } finally {
      streamRef.current = null;
      abortControllerRef.current = null;
      setStreaming(false);
    }

    // Berjaya: simpan respons AI ke messages.
    // Guna `buffer` lokal (BUKAN state `currentResponse` — nilai state
    // dalam closure ini basi/kosong, itulah punca respons hilang).
    if (buffer.trim()) {
      setMessages((m) => [...m, { role: "assistant", content: buffer }]);
    } else {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Maaf, saya tidak dapat menjawab. Sila cuba lagi." },
      ]);
    }
    setCurrentResponse("");
  };

  const handleClose = () => {
    stopStreaming();
    setOpen(false);
  };

  return (
    <>
      {/* Tombol buka */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow-lg transition-transform hover:scale-110 md:bottom-28 md:right-6 lg:bottom-6 lg:right-6"
        aria-label="Buka chatbot"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-viral-pink opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-viral-pink" />
          </span>
        )}
      </motion.button>

      {/* Balai chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft-lg md:bottom-28 md:right-6 lg:bottom-6 lg:right-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-gradient-brand px-5 py-4">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Flame className="h-5 w-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-primary bg-success" />
              </span>
              <div>
                <p className="font-heading font-bold text-white">Vira</p>
                <p className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                  Dalam talian • Streaming AI
                </p>
              </div>
              <button
                onClick={handleClose}
                className="ml-auto rounded-lg p-1.5 text-white/80 hover:bg-white/20"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mesej */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-2",
                    m.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  {m.role === "assistant" ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
                      <Flame className="h-3.5 w-3.5 text-white" />
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-bgalt text-secondary">
                      <User className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "assistant"
                        ? "rounded-tl-sm border border-gray-100 bg-bgalt"
                        : "rounded-tr-sm bg-gradient-brand text-white shadow-glow"
                    )}
                  >
                    {m.role === "assistant" ? (
                      <MarkdownMessage text={m.content} />
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Streaming response */}
              {(streaming || currentResponse) && (
                <motion.div
                  key="streaming"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
                    <Flame className="h-3.5 w-3.5 text-white animate-pulse" />
                  </span>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-gray-100 bg-bgalt px-4 py-2.5 text-sm leading-relaxed">
                    {currentResponse && <MarkdownMessage text={currentResponse} />}
                    {streaming && (
                      <span className="inline-flex items-center gap-1 ml-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            {messages.length === 1 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-gray-100 p-3">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    <Sparkles className="h-3 w-3" /> {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-gray-100 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={streaming ? "AI sedang menaip..." : "Taip soalan..."}
                disabled={streaming}
                className="h-11 flex-1 rounded-xl border border-gray-200 bg-bgalt px-4 text-sm outline-none transition-colors placeholder:text-textsec focus:border-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                className="btn-primary h-11 w-11 !rounded-xl !px-0"
                aria-label={streaming ? "Menghentikan..." : "Hantar"}
              >
                {streaming ? <X className="h-5 w-5" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}