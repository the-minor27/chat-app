import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    MessageCircle,
    ShieldCheck,
    Sparkles,
    UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const signupSchema = z
    .object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name is too long"),

        email: z
            .string()
            .email("Please enter a valid email address"),

        password: z
            .string()
            .min(6, "Password must be at least 6 characters"),

        confirmPassword: z
            .string()
            .min(6, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const Signup = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setServerError("");

            const response = await fetch(
                "http://localhost:3000/api/auth/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: data.name,
                        email: data.email,
                        password: data.password,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setServerError(
                    result.message || "Something went wrong"
                );
                return;
            }

            navigate("/login");
        } catch (error) {
            setServerError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-[#edf4f0] p-0 md:p-4">
            <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-200/40 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-48 -right-40 h-[600px] w-[600px] rounded-full bg-green-200/30 blur-3xl" />

            <div className="pointer-events-none absolute right-[22%] top-8 h-48 w-48 rounded-full bg-white/60 blur-3xl" />

            <div className="relative mx-auto flex h-full max-w-[1450px] overflow-hidden bg-white shadow-2xl md:rounded-3xl">
                <div className="relative hidden w-[52%] overflow-hidden bg-[#10231e] lg:flex">
                    <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full border border-emerald-400/10" />

                    <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-emerald-400/10" />

                    <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl" />

                    <div className="absolute right-10 top-1/2 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

                    <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-950/30">
                                    <MessageCircle
                                        size={21}
                                        strokeWidth={2.5}
                                        className="text-white"
                                    />
                                </div>

                                <div>
                                    <h1 className="text-lg font-bold tracking-[0.18em] text-white">
                                        NEXORA
                                    </h1>

                                    <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-emerald-300/60">
                                        Connect beyond
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                                <Sparkles size={13} />
                                Your conversations, reimagined
                            </div>

                            <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-white xl:text-4xl">
                                Connect with people.
                                <span className="mt-1.5 block text-emerald-400">
                                    Stay in the moment.
                                </span>
                            </h2>

                            <p className="mt-4 max-w-lg text-sm leading-6 text-white/55">
                                Nexora gives you a simple, modern space to connect,
                                communicate, and keep your conversations organized.
                            </p>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <Check
                                            size={14}
                                            className="text-emerald-400"
                                        />
                                    </div>

                                    <span className="text-xs text-white/70">
                                        Simple and focused messaging
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <Check
                                            size={14}
                                            className="text-emerald-400"
                                        />
                                    </div>

                                    <span className="text-xs text-white/70">
                                        Real-time conversation experience
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                                        <ShieldCheck
                                            size={14}
                                            className="text-emerald-400"
                                        />
                                    </div>

                                    <span className="text-xs text-white/70">
                                        Secure account authentication
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/10 pt-4">
                            <p className="text-[10px] text-white/30">
                                © 2026 Nexora
                            </p>

                            <p className="text-[10px] text-white/30">
                                Connect. Chat. Stay close.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-1 items-center justify-center overflow-y-auto px-5 py-5 sm:px-10">
                    <div className="w-full max-w-[420px]">
                        <div className="mb-6 flex items-center justify-center lg:hidden">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10231e]">
                                    <MessageCircle
                                        size={21}
                                        className="text-emerald-400"
                                    />
                                </div>

                                <div>
                                    <h1 className="text-lg font-bold tracking-[0.18em] text-[#10231e]">
                                        NEXORA
                                    </h1>

                                    <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-emerald-700/60">
                                        Connect beyond
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-5">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                                <UserPlus
                                    size={20}
                                    className="text-emerald-700"
                                />
                            </div>

                            <h2 className="text-2xl font-bold tracking-tight text-[#10231e]">
                                Create your account
                            </h2>

                            <p className="mt-1 text-sm leading-5 text-slate-500">
                                Join Nexora and start connecting with people.
                            </p>
                        </div>

                        {serverError && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600">
                                {serverError}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-3.5"
                        >
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#263c35]">
                                    Full name
                                </label>

                                <Input
                                    {...register("name")}
                                    placeholder="Enter your full name"
                                    className={`h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm transition focus-visible:border-emerald-500 focus-visible:ring-emerald-100 ${errors.name
                                        ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100"
                                        : ""
                                        }`}
                                />

                                {errors.name && (
                                    <p className="mt-1 text-[11px] text-red-500">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#263c35]">
                                    Email address
                                </label>

                                <Input
                                    {...register("email")}
                                    type="email"
                                    placeholder="you@example.com"
                                    className={`h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm transition focus-visible:border-emerald-500 focus-visible:ring-emerald-100 ${errors.email
                                        ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100"
                                        : ""
                                        }`}
                                />

                                {errors.email && (
                                    <p className="mt-1 text-[11px] text-red-500">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#263c35]">
                                    Password
                                </label>

                                <div className="relative">
                                    <Input
                                        {...register("password")}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        className={`h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 pr-12 text-sm transition focus-visible:border-emerald-500 focus-visible:ring-emerald-100 ${errors.password
                                            ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100"
                                            : ""
                                            }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((previous) => !previous)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="mt-1 text-[11px] text-red-500">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-[#263c35]">
                                    Confirm password
                                </label>

                                <div className="relative">
                                    <Input
                                        {...register("confirmPassword")}
                                        type={
                                            showConfirmPassword ? "text" : "password"
                                        }
                                        placeholder="Confirm your password"
                                        className={`h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 pr-12 text-sm transition focus-visible:border-emerald-500 focus-visible:ring-emerald-100 ${errors.confirmPassword
                                            ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100"
                                            : ""
                                            }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (previous) => !previous
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>
                                </div>

                                {errors.confirmPassword && (
                                    <p className="mt-1 text-[11px] text-red-500">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="group mt-1 h-11 w-full rounded-xl bg-[#10231e] text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition-all hover:bg-[#193a31] hover:shadow-xl disabled:opacity-60"
                            >
                                {loading ? (
                                    "Creating account..."
                                ) : (
                                    <>
                                        Create Nexora Account

                                        <ArrowRight
                                            size={16}
                                            className="ml-2 transition-transform group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                            <p className="text-xs text-slate-500">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold text-emerald-700 transition hover:text-emerald-800"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                            <ShieldCheck size={13} />
                            <span>
                                Your account information is securely handled
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;