"use client";

/**
 * EmailVerificationBanner (#206)
 *
 * Surfaces a dashboard-wide reminder that the user's email is not yet
 * verified, with two affordances:
 *  - **Resend verification** — fires the caller's `onResend` handler with
 *    a built-in cooldown counter (default 60s) to prevent spamming the
 *    backend.
 *  - **Dismiss** — hides the banner for the current browser session
 *    via `sessionStorage`, so the next page load / browser refresh
 *    re-evaluates against the (still-unverified) email and re-shows
 *    the banner. The dismiss does NOT reset the resend-email cooldown.
 *
 * Storage convention: the dismissal flag is per-user (keyed by the
 * supplied `userId`) so the banner doesn't bleed across account
 * switches in the same tab.
 *
 * Originally requested as a follow-up to PR #202 (which was closed
 * before merge). The banner ships here with the dismissible behavior
 * baked in from the start.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon, ICON_PATHS, LoadingSpinner } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export interface EmailVerificationBannerProps {
    /**
     * Stable user identifier. Used to key the per-session dismissal
     * flag so a logout / login switch doesn't carry the prior user's
     * dismissal forward.
     */
    userId: string;
    /** Defaults to false — when true the banner does not render. */
    isVerified?: boolean;
    /** The email address shown in the body copy. Optional. */
    email?: string;
    /**
     * Caller-supplied resend handler. May return a Promise — the
     * banner shows a spinner while it's pending and clears it on
     * resolution (success or failure).
     */
    onResend?: () => Promise<unknown> | void;
    /**
     * Cooldown in seconds before the resend button is re-enabled
     * after a successful click. Default 60s. The dismiss action does
     * **not** interfere with this timer.
     */
    resendCooldownSeconds?: number;
    className?: string;
}

const DEFAULT_COOLDOWN_SECONDS = 60;
const STORAGE_PREFIX = "offerhub:email-verification-banner-dismissed:";

const dismissalKey = (userId: string) => `${STORAGE_PREFIX}${userId}`;

const readDismissed = (userId: string): boolean => {
    if (typeof window === "undefined") return false;
    try {
        return window.sessionStorage.getItem(dismissalKey(userId)) === "1";
    } catch {
        // sessionStorage can throw in private modes / strict CSP. Treat
        // an inaccessible store as "not dismissed" so the banner stays
        // visible — that's the safer failure mode for a verification
        // reminder.
        return false;
    }
};

const writeDismissed = (userId: string) => {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.setItem(dismissalKey(userId), "1");
    } catch {
        /* see readDismissed — swallow and continue. */
    }
};

export function EmailVerificationBanner({
    userId,
    isVerified = false,
    email,
    onResend,
    resendCooldownSeconds = DEFAULT_COOLDOWN_SECONDS,
    className,
}: EmailVerificationBannerProps) {
    const [dismissed, setDismissed] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    // Re-read the dismissal flag on mount + whenever the userId
    // changes. The dismissal is per-session (sessionStorage) so it
    // automatically clears on a new browser session / refresh in a
    // fresh tab; this re-read covers the in-tab account-switch case.
    useEffect(() => {
        setDismissed(readDismissed(userId));
    }, [userId]);

    // Drive the resend cooldown countdown.
    useEffect(() => {
        if (cooldownRemaining <= 0) return;
        const id = window.setInterval(() => {
            setCooldownRemaining(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => window.clearInterval(id);
    }, [cooldownRemaining]);

    const handleDismiss = useCallback(() => {
        writeDismissed(userId);
        setDismissed(true);
    }, [userId]);

    const handleResend = useCallback(async () => {
        if (resending || cooldownRemaining > 0 || !onResend) return;
        setResending(true);
        setResendSuccess(false);
        try {
            await Promise.resolve(onResend());
            setResendSuccess(true);
            setCooldownRemaining(resendCooldownSeconds);
        } catch {
            // Surface failures via the caller's own toast / error
            // pipeline — the banner intentionally stays neutral so
            // it doesn't clash with the app's global error UI.
        } finally {
            setResending(false);
        }
    }, [onResend, resending, cooldownRemaining, resendCooldownSeconds]);

    const resendDisabled = useMemo(
        () => resending || cooldownRemaining > 0 || !onResend,
        [resending, cooldownRemaining, onResend]
    );

    if (isVerified || dismissed) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            data-testid="email-verification-banner"
            className={cn(
                "flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-neumorphic-light)] sm:flex-row sm:items-center sm:justify-between",
                className
            )}
        >
            <div className="flex items-start gap-3 sm:items-center">
                <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"
                >
                    <Icon path={ICON_PATHS.mail} size="md" />
                </span>
                <div className="min-w-0">
                    <p className="font-semibold text-text-primary">
                        Verify your email address
                    </p>
                    <p className="text-sm text-text-secondary">
                        {email
                            ? `Check ${email} for the verification link to unlock all account features.`
                            : "Check your inbox for the verification link to unlock all account features."}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendDisabled}
                    aria-busy={resending || undefined}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:bg-amber-500/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {resending ? (
                        <>
                            <LoadingSpinner size="sm" />
                            Sending…
                        </>
                    ) : resendSuccess && cooldownRemaining > 0 ? (
                        <>
                            <Icon
                                path={ICON_PATHS.check}
                                size="sm"
                            />
                            Sent · retry in {cooldownRemaining}s
                        </>
                    ) : cooldownRemaining > 0 ? (
                        <>Retry in {cooldownRemaining}s</>
                    ) : (
                        <>
                            <Icon path={ICON_PATHS.mail} size="sm" />
                            Resend email
                        </>
                    )}
                </button>
                <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss verification reminder for this session"
                    data-testid="email-verification-banner-dismiss"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-background hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
                >
                    <Icon path={ICON_PATHS.x} size="sm" />
                </button>
            </div>
        </div>
    );
}

export default EmailVerificationBanner;
