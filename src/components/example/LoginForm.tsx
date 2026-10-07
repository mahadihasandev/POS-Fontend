"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { setCookie, getCookie } from "cookies-next";
import { Lock, Mail, ShieldCheck, CheckCircle2, KeyRound } from "lucide-react";
import { useLoginMutation } from "@/redux/api/authApi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/typography";

// 1. Zod Validation Schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(100, "Password exceeds maximum allowable length"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [activeToken, setActiveToken] = useState<string | null>(() => {
    const existing = getCookie("token");
    return typeof existing === "string" ? existing : null;
  });

  // 2. RTK Query Mutation Hook
  const [login, { isLoading }] = useLoginMutation();

  // 3. React Hook Form with Zod Resolver
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  // 4. Submission Handler
  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await login(values).unwrap();

      if (response?.data?.token) {
        setCookie("token", response.data.token, {
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
          sameSite: "lax",
        });
        setActiveToken(response.data.token);
      }

      toast.success(response.message || "Authentication successful! Token saved.");
      reset();
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Login request failed. Verify backend service is running.";
      toast.error(errorMsg);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <CardTitle>Sign In to Drive</CardTitle>
            <CardDescription>Next.js App Router + RTK Query + Zod</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email Input Component */}
          <Input
            label="Email Address"
            type="email"
            placeholder="user@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          {/* Password Input Component */}
          <Input
            label="Password"
            type="password"
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          {/* Button Component */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            rightIcon={<KeyRound className="w-4 h-4" />}
            className="w-full mt-2"
          >
            Submit via RTK Query
          </Button>
        </form>

        {/* Active Cookie Token Inspector */}
        {activeToken && (
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" pulse>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Cookie Token</span>
              </Badge>
            </div>
            <Text variant="code" className="block break-all">
              {activeToken.slice(0, 36)}...
            </Text>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
