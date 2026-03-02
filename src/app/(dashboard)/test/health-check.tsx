"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function HealthCheck() {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.health.queryOptions());

    return (
        <div>
            <p>Health Check</p>
            <p className="mt-2 text-lg font-semibold">✅{data.status}</p>
        </div>
    );
};