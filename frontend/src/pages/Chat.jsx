import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Search,
    Send,
    MoreVertical,
    Phone,
    Video,
    LogOut,
    Plus,
    MessageCircle,
    Check,
    CheckCheck,
    Users,
    Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const API_URL = "http://localhost:3000/api";

const Chat = () => {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);

    const [messageText, setMessageText] = useState("");
    const [searchText, setSearchText] = useState("");
    const [newChatEmail, setNewChatEmail] = useState("");

    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [newChatOpen, setNewChatOpen] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!token) {
            navigate("/login");
            return;
        }

        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }

        fetchConversations();
    }, []);

    const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const fetchConversations = async () => {
        try {
            setLoadingConversations(true);

            const response = await fetch(`${API_URL}/conversations`, {
                headers: authHeaders,
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }

                throw new Error(data.message || "Failed to load conversations");
            }

            setConversations(data.conversations || []);

            if (data.conversations?.length > 0) {
                setSelectedConversation((previous) => {
                    if (!previous) {
                        return data.conversations[0];
                    }

                    const updatedConversation = data.conversations.find(
                        (conversation) => conversation._id === previous._id
                    );

                    return updatedConversation || data.conversations[0];
                });
            }
        } catch (error) {
            console.log("Conversation error:", error.message);
        } finally {
            setLoadingConversations(false);
        }
    };

    useEffect(() => {
        if (!selectedConversation) {
            setMessages([]);
            return;
        }

        fetchMessages(selectedConversation._id);
        markMessagesAsRead(selectedConversation._id);
    }, [selectedConversation]);

    const fetchMessages = async (conversationId) => {
        try {
            setLoadingMessages(true);

            const response = await fetch(
                `${API_URL}/messages/${conversationId}`,
                {
                    headers: authHeaders,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }

                throw new Error(data.message || "Failed to load messages");
            }

            setMessages(data.messages || []);
        } catch (error) {
            console.log("Messages error:", error.message);
        } finally {
            setLoadingMessages(false);
        }
    };

    const markMessagesAsRead = async (conversationId) => {
        try {
            await fetch(`${API_URL}/messages/${conversationId}/read`, {
                method: "PATCH",
                headers: authHeaders,
            });

            setConversations((previous) =>
                previous.map((conversation) =>
                    conversation._id === conversationId
                        ? { ...conversation, unreadCount: 0 }
                        : conversation
                )
            );
        } catch (error) {
            console.log("Read status error:", error.message);
        }
    };

    const sendMessage = async (event) => {
        event.preventDefault();

        if (
            !messageText.trim() ||
            !selectedConversation ||
            sendingMessage
        ) {
            return;
        }

        try {
            setSendingMessage(true);

            const response = await fetch(`${API_URL}/messages`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    conversationId: selectedConversation._id,
                    content: messageText.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }

                throw new Error(data.message || "Failed to send message");
            }

            setMessages((previous) => [...previous, data.message]);
            setMessageText("");

            setConversations((previous) =>
                previous.map((conversation) =>
                    conversation._id === selectedConversation._id
                        ? {
                            ...conversation,
                            updatedAt: new Date().toISOString(),
                        }
                        : conversation
                )
            );
        } catch (error) {
            console.log("Send message error:", error.message);
        } finally {
            setSendingMessage(false);
        }
    };

    const createConversation = async () => {
        if (!newChatEmail.trim()) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/conversations`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    email: newChatEmail.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }

                throw new Error(
                    data.message || "Failed to create conversation"
                );
            }

            setNewChatEmail("");
            setNewChatOpen(false);

            await fetchConversations();

            if (data.conversation) {
                setSelectedConversation(data.conversation);
            }
        } catch (error) {
            console.log("Create conversation error:", error.message);
            alert(error.message);
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                headers: authHeaders,
            });
        } catch (error) {
            console.log("Logout error:", error.message);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const getOtherUser = (conversation) => {
        if (!conversation?.members || !currentUser) {
            return null;
        }

        return (
            conversation.members.find(
                (member) => member._id !== currentUser.id
            ) || conversation.members[0]
        );
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter((conversation) => {
            const otherUser = getOtherUser(conversation);

            if (!otherUser) {
                return false;
            }

            return (
                otherUser.name
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                otherUser.email
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase())
            );
        });
    }, [conversations, searchText, currentUser]);

    const formatTime = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getInitials = (name = "") => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    return (
        <div className="relative h-screen overflow-hidden bg-[#edf4f0] p-0 md:p-5">
            <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-48 -right-40 h-[600px] w-[600px] rounded-full bg-green-200/30 blur-3xl" />
            <div className="pointer-events-none absolute right-[22%] top-8 h-48 w-48 rounded-full bg-white/60 blur-3xl" />

            <div className="relative mx-auto flex h-full max-w-[1500px] overflow-hidden bg-white shadow-2xl md:h-[calc(100vh-40px)] md:rounded-[28px]">
                SIDEBAR
                <aside className="flex w-[360px] shrink-0 flex-col bg-[#0d211b] text-white">
                    <div className="border-b border-white/[0.08] px-5 pb-5 pt-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 shadow-lg shadow-emerald-950/30">
                                    <MessageCircle
                                        size={21}
                                        className="fill-[#0d211b] text-[#0d211b]"
                                    />
                                </div>

                                <div>
                                    <h1 className="text-[20px] font-bold tracking-tight">
                                        Nexora
                                    </h1>

                                    <p className="text-[11px] text-emerald-200/50">
                                        Connect. Chat. Stay close.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setNewChatOpen(true)}
                                size="icon"
                                className="h-10 w-10 rounded-xl bg-emerald-400 text-[#0d211b] shadow-lg shadow-emerald-950/20 hover:bg-emerald-300"
                            >
                                <Plus size={19} strokeWidth={2.5} />
                            </Button>
                        </div>

                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/40"
                            />

                            <Input
                                value={searchText}
                                onChange={(event) =>
                                    setSearchText(event.target.value)
                                }
                                placeholder="Search conversations..."
                                className="h-11 rounded-xl border-white/[0.08] bg-white/[0.07] pl-10 text-sm text-white placeholder:text-white/30 focus-visible:border-emerald-400/40 focus-visible:ring-emerald-400/10"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-5 pb-2 pt-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                            Conversations
                        </p>

                        {conversations.length > 0 && (
                            <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] text-white/40">
                                {conversations.length}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 pb-3">
                        {loadingConversations ? (
                            <div className="space-y-2 px-2 pt-2">
                                {[1, 2, 3, 4].map((item) => (
                                    <div
                                        key={item}
                                        className="flex animate-pulse items-center gap-3 rounded-2xl p-3"
                                    >
                                        <div className="h-11 w-11 rounded-full bg-white/[0.07]" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-24 rounded bg-white/[0.07]" />
                                            <div className="h-2.5 w-16 rounded bg-white/[0.05]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06]">
                                    <MessageCircle
                                        size={25}
                                        className="text-emerald-300/80"
                                    />
                                </div>

                                <p className="text-sm font-semibold text-white/75">
                                    No conversations
                                </p>

                                <p className="mt-1 text-xs leading-5 text-white/30">
                                    Start a new conversation and connect with someone.
                                </p>

                                <Button
                                    onClick={() => setNewChatOpen(true)}
                                    className="mt-5 h-9 rounded-xl bg-emerald-400 px-4 text-xs font-semibold text-[#0d211b] hover:bg-emerald-300"
                                >
                                    <Plus size={15} />
                                    Start Chat
                                </Button>
                            </div>
                        ) : (
                            filteredConversations.map((conversation) => {
                                const otherUser = getOtherUser(conversation);

                                if (!otherUser) return null;

                                const isSelected =
                                    selectedConversation?._id === conversation._id;

                                return (
                                    <button
                                        key={conversation._id}
                                        onClick={() =>
                                            setSelectedConversation(conversation)
                                        }
                                        className={`group mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200 ${isSelected
                                            ? "bg-emerald-400 text-[#0d211b] shadow-lg shadow-emerald-950/20"
                                            : "text-white hover:bg-white/[0.06]"
                                            }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-[17px] text-sm font-bold ${isSelected
                                                    ? "bg-[#0d211b] text-emerald-300"
                                                    : "bg-[#17362c] text-emerald-200"
                                                    }`}
                                            >
                                                {getInitials(otherUser.name)}
                                            </div>

                                            {otherUser.isOnline && (
                                                <span
                                                    className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[3px] ${isSelected
                                                        ? "border-emerald-400 bg-[#0d211b]"
                                                        : "border-[#0d211b] bg-emerald-400"
                                                        }`}
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate text-sm font-semibold">
                                                    {otherUser.name}
                                                </p>

                                                {conversation.updatedAt && (
                                                    <span
                                                        className={`shrink-0 text-[10px] ${isSelected
                                                            ? "text-[#0d211b]/50"
                                                            : "text-white/25"
                                                            }`}
                                                    >
                                                        {formatTime(conversation.updatedAt)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 flex items-center justify-between gap-2">
                                                <p
                                                    className={`truncate text-xs ${isSelected
                                                        ? "text-[#0d211b]/60"
                                                        : "text-white/30"
                                                        }`}
                                                >
                                                    {otherUser.isOnline ? "Active now" : "Offline"}
                                                </p>

                                                {conversation.unreadCount > 0 && (
                                                    <span
                                                        className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${isSelected
                                                            ? "bg-[#0d211b] text-emerald-300"
                                                            : "bg-emerald-400 text-[#0d211b]"
                                                            }`}
                                                    >
                                                        {conversation.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="border-t border-white/[0.08] p-4">
                        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.045] p-3">
                            <div className="relative shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-emerald-400 text-sm font-bold text-[#0d211b]">
                                    {getInitials(currentUser?.name)}
                                </div>

                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#17362c] bg-emerald-400" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                    {currentUser?.name || "User"}
                                </p>

                                <p className="truncate text-[11px] text-white/30">
                                    {currentUser?.email}
                                </p>
                            </div>

                            <button
                                onClick={logout}
                                title="Logout"
                                className="rounded-xl p-2 text-white/30 transition hover:bg-white/[0.07] hover:text-red-300"
                            >
                                <LogOut size={17} />
                            </button>
                        </div>
                    </div>
                </aside>


                <main className="relative flex min-w-0 flex-1 flex-col bg-[#f4f7f5]">
                    {selectedConversation ? (
                        <>

                            <header className="flex h-[82px] shrink-0 items-center justify-between border-b border-[#10231e]/[0.07] bg-white/90 px-5 backdrop-blur-xl md:px-7">
                                <div className="flex min-w-0 items-center gap-3.5">
                                    {(() => {
                                        const otherUser =
                                            getOtherUser(selectedConversation);

                                        return (
                                            <>
                                                <div className="relative">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-[#0d211b] text-sm font-bold text-emerald-300 shadow-sm">
                                                        {getInitials(otherUser?.name)}
                                                    </div>

                                                    {otherUser?.isOnline && (
                                                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-500" />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <h2 className="truncate text-[15px] font-bold text-[#10231e]">
                                                        {otherUser?.name}
                                                    </h2>

                                                    <div className="mt-1 flex items-center gap-1.5">
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${otherUser?.isOnline
                                                                ? "bg-emerald-500"
                                                                : "bg-slate-300"
                                                                }`}
                                                        />

                                                        <p className="text-xs text-slate-400">
                                                            {otherUser?.isOnline
                                                                ? "Active now"
                                                                : "Offline"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hidden rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 sm:flex"
                                    >
                                        <Phone size={18} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hidden rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 sm:flex"
                                    >
                                        <Video size={19} />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                                    >
                                        <MoreVertical size={19} />
                                    </Button>
                                </div>
                            </header>


                            <div className="relative flex-1 overflow-y-auto px-4 py-7 md:px-10">

                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.05),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.04),transparent_25%)]" />

                                <div className="relative z-10">
                                    {loadingMessages ? (
                                        <div className="flex h-full min-h-[400px] items-center justify-center">
                                            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2.5 shadow-sm">
                                                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                                <p className="text-xs font-medium text-slate-400">
                                                    Loading messages...
                                                </p>
                                            </div>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex min-h-[calc(100vh-250px)] flex-col items-center justify-center text-center">
                                            <div className="relative mb-6">
                                                <div className="absolute inset-0 rounded-[28px] bg-emerald-200/40 blur-2xl" />

                                                <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#0d211b] shadow-xl">
                                                    <MessageCircle
                                                        size={34}
                                                        className="text-emerald-300"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Sparkles
                                                    size={15}
                                                    className="text-emerald-500"
                                                />

                                                <h3 className="text-lg font-bold text-[#10231e]">
                                                    Start something new
                                                </h3>
                                            </div>

                                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                                                Send your first message to{" "}
                                                <span className="font-semibold text-slate-600">
                                                    {getOtherUser(selectedConversation)?.name}
                                                </span>{" "}
                                                and start the conversation.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="mx-auto flex max-w-4xl flex-col gap-4">
                                            {messages.map((message) => {
                                                const isMine =
                                                    message.senderId?._id ===
                                                    currentUser?.id ||
                                                    message.senderId === currentUser?.id;

                                                return (
                                                    <div
                                                        key={message._id}
                                                        className={`flex ${isMine
                                                            ? "justify-end"
                                                            : "justify-start"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`flex max-w-[82%] flex-col md:max-w-[62%] ${isMine
                                                                ? "items-end"
                                                                : "items-start"
                                                                }`}
                                                        >
                                                            <div
                                                                className={`rounded-[20px] px-4 py-3 text-sm leading-6 shadow-sm ${isMine
                                                                    ? "rounded-br-md bg-[#0d211b] text-white shadow-emerald-950/10"
                                                                    : "rounded-bl-md border border-slate-200/80 bg-white text-[#263c35]"
                                                                    }`}
                                                            >
                                                                {message.content}
                                                            </div>

                                                            <div
                                                                className={`mt-1.5 flex items-center gap-1.5 px-1 text-[10px] text-slate-400 ${isMine
                                                                    ? "flex-row-reverse"
                                                                    : ""
                                                                    }`}
                                                            >
                                                                <span>
                                                                    {formatTime(message.createdAt)}
                                                                </span>

                                                                {isMine &&
                                                                    (message.isRead ? (
                                                                        <CheckCheck
                                                                            size={13}
                                                                            className="text-emerald-600"
                                                                        />
                                                                    ) : (
                                                                        <Check size={13} />
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>


                            <div className="border-t border-[#10231e]/[0.06] bg-white px-4 py-4 md:px-7">
                                <form
                                    onSubmit={sendMessage}
                                    className="mx-auto flex max-w-4xl items-center gap-3"
                                >
                                    <div className="flex min-h-[52px] flex-1 items-center rounded-2xl border border-slate-200 bg-[#f7f9f8] px-4 shadow-sm transition focus-within:border-emerald-400/50 focus-within:bg-white focus-within:shadow-md">
                                        <Input
                                            value={messageText}
                                            onChange={(event) =>
                                                setMessageText(event.target.value)
                                            }
                                            placeholder="Write a message..."
                                            className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={
                                            !messageText.trim() || sendingMessage
                                        }
                                        size="icon"
                                        className="h-[52px] w-[52px] shrink-0 rounded-2xl bg-[#0d211b] text-white shadow-lg shadow-emerald-950/15 transition hover:bg-[#17362c] disabled:cursor-not-allowed disabled:opacity-35"
                                    >
                                        <Send size={18} />
                                    </Button>
                                </form>

                                <p className="mt-2 hidden text-center text-[10px] text-slate-300 sm:block">
                                    Press Enter to send your message
                                </p>
                            </div>
                        </>
                    ) : (

                        <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6">
                            <div className="pointer-events-none absolute left-[20%] top-[15%] h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl" />
                            <div className="pointer-events-none absolute bottom-[10%] right-[15%] h-56 w-56 rounded-full bg-green-100/60 blur-3xl" />

                            <div className="relative max-w-md text-center">
                                <div className="relative mx-auto mb-7 h-24 w-24">
                                    <div className="absolute inset-0 rounded-[30px] bg-emerald-200/50 blur-2xl" />

                                    <div className="relative flex h-24 w-24 items-center justify-center rounded-[30px] bg-[#0d211b] shadow-2xl">
                                        <MessageCircle
                                            size={40}
                                            className="text-emerald-300"
                                        />
                                    </div>
                                </div>

                                <div className="mb-2 flex items-center justify-center gap-2">
                                    <Sparkles
                                        size={16}
                                        className="text-emerald-500"
                                    />

                                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                                        Welcome to Nexora
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold tracking-tight text-[#10231e]">
                                    Connect with your people.
                                </h2>

                                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
                                    Select a conversation from the sidebar or start
                                    a new chat to begin messaging.
                                </p>

                                <Button
                                    onClick={() => setNewChatOpen(true)}
                                    className="mt-7 h-11 rounded-xl bg-[#0d211b] px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 hover:bg-[#17362c]"
                                >
                                    <Plus size={17} />
                                    New Conversation
                                </Button>
                            </div>
                        </div>
                    )}
                </main>
            </div>


            <Dialog
                open={newChatOpen}
                onOpenChange={setNewChatOpen}
            >
                <DialogContent className="max-w-md overflow-hidden rounded-[24px] border-slate-200 p-0">
                    <div className="bg-[#0d211b] px-6 pb-6 pt-7 text-white">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-[#0d211b]">
                            <MessageCircle size={21} />
                        </div>

                        <DialogHeader className="text-left">
                            <DialogTitle className="text-xl font-bold text-white">
                                Start a new conversation
                            </DialogTitle>

                            <DialogDescription className="mt-1 text-sm leading-5 text-white/45">
                                Connect with another Nexora user using their
                                email address.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="space-y-5 p-6">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#263c35]">
                                User email
                            </label>

                            <Input
                                value={newChatEmail}
                                onChange={(event) =>
                                    setNewChatEmail(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        createConversation();
                                    }
                                }}
                                placeholder="example@email.com"
                                className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus-visible:border-emerald-400 focus-visible:ring-emerald-100"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setNewChatOpen(false);
                                    setNewChatEmail("");
                                }}
                                className="rounded-xl text-slate-500 hover:bg-slate-100"
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={createConversation}
                                disabled={!newChatEmail.trim()}
                                className="rounded-xl bg-[#0d211b] px-4 text-white hover:bg-[#17362c]"
                            >
                                <Users size={16} />
                                Start Chat
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Chat;