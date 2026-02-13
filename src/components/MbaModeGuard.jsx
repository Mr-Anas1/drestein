"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ONLY_MBA } from "@/lib/flags";

const DEFAULT_ALLOWED_PREFIXES = [
    "/ascend",
    "/my-passes",
    "/my-ticket",
    "/view-ticket",
    "/api/payments/ccavenue/mba",
    "/admin",
];

export default function MbaModeGuard({ children, allowedPrefixes = DEFAULT_ALLOWED_PREFIXES }) {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!ONLY_MBA) return;
        if (!pathname) return;

        const isAllowed = allowedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
        if (!isAllowed) {
            router.replace("/ascend");
        }
    }, [pathname, router, allowedPrefixes]);

    return children;
}
