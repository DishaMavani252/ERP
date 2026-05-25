import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { getAllSyncLogs, getSyncLogsCount } from "../models/syncLog.server";

const PAGE_SIZE = 20;

export const loader = async ({ request }) => {
    await authenticate.admin(request);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const skip = (page - 1) * PAGE_SIZE;

    const [logs, total] = await Promise.all([
        getAllSyncLogs({ skip, take: PAGE_SIZE }),
        getSyncLogsCount(),
    ]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return {
        logs: logs.map((log) => ({
            ...log,
            payload: undefined, // don't send large payload to frontend
            createdAt: log.createdAt.toISOString(),
            processedAt: log.processedAt ? log.processedAt.toISOString() : null,
        })),
        page,
        totalPages,
        total,
    };
};

function statusBadge(status) {
    if (status === "success") return "success";
    if (status === "failed") return "critical";
    return "attention";
}

export default function SyncLogsPage() {
    const { logs, page, totalPages, total } = useLoaderData();
    const navigate = useNavigate();

    return (
        <s-page heading="Sync Logs">
            <s-section heading={`All webhook sync events (${total} total)`}>
                {logs.length === 0 ? (
                    <s-paragraph>No sync logs yet. Logs appear here after products are created, updated, or deleted in your Shopify store.</s-paragraph>
                ) : (
                    <s-stack direction="block" gap="tight">
                        {/* Header row */}
                        <s-box
                            padding="tight"
                            borderWidth="base"
                            borderRadius="base"
                            background="subdued"
                        >
                            <s-stack direction="inline" gap="base">
                                <s-text variant="bodyMd" fontWeight="bold" style={{ width: "60px" }}>ID</s-text>
                                <s-text variant="bodyMd" fontWeight="bold" style={{ flex: 1 }}>Topic</s-text>
                                <s-text variant="bodyMd" fontWeight="bold" style={{ flex: 1 }}>Product ID</s-text>
                                <s-text variant="bodyMd" fontWeight="bold" style={{ width: "80px" }}>Status</s-text>
                                <s-text variant="bodyMd" fontWeight="bold" style={{ width: "40px" }}>Retries</s-text>
                                <s-text variant="bodyMd" fontWeight="bold" style={{ flex: 1 }}>Error</s-text>
                                <s-text variant="bodyMd" fontWeight="bold" style={{ flex: 1 }}>Created At</s-text>
                            </s-stack>
                        </s-box>

                        {/* Data rows */}
                        {logs.map((log) => (
                            <s-box
                                key={log.id}
                                padding="tight"
                                borderWidth="base"
                                borderRadius="base"
                            >
                                <s-stack direction="inline" gap="base">
                                    <s-text style={{ width: "60px" }}>{log.id}</s-text>
                                    <s-text style={{ flex: 1 }}>{log.topic}</s-text>
                                    <s-text style={{ flex: 1 }}>{log.productId || "—"}</s-text>
                                    <s-badge
                                        style={{ width: "80px" }}
                                        tone={statusBadge(log.status)}
                                    >
                                        {log.status}
                                    </s-badge>
                                    <s-text style={{ width: "40px" }}>{log.retryCount}</s-text>
                                    <s-text
                                        tone={log.errorMessage ? "critical" : "subdued"}
                                        style={{ flex: 1 }}
                                    >
                                        {log.errorMessage || "—"}
                                    </s-text>
                                    <s-text style={{ flex: 1 }}>
                                        {new Date(log.createdAt).toLocaleString()}
                                    </s-text>
                                </s-stack>
                            </s-box>
                        ))}
                    </s-stack>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <s-stack direction="inline" gap="base">
                        <s-button
                            disabled={page <= 1}
                            onClick={() => navigate(`/app/sync-logs?page=${page - 1}`)}
                        >
                            Previous
                        </s-button>
                        <s-text>Page {page} of {totalPages}</s-text>
                        <s-button
                            disabled={page >= totalPages}
                            onClick={() => navigate(`/app/sync-logs?page=${page + 1}`)}
                        >
                            Next
                        </s-button>
                    </s-stack>
                )}
            </s-section>

            <s-section slot="aside" heading="About Sync Logs">
                <s-paragraph>
                    Every Shopify webhook event is recorded here. A log entry is created for each product create, update, or delete event.
                </s-paragraph>
                <s-paragraph>
                    Failed syncs are automatically retried up to 3 times. Use the Retry button on the Dashboard to trigger manual retries.
                </s-paragraph>
                <s-unordered-list>
                    <s-list-item><s-badge tone="success">success</s-badge> — ERP sync succeeded</s-list-item>
                    <s-list-item><s-badge tone="critical">failed</s-badge> — ERP sync failed (will retry)</s-list-item>
                </s-unordered-list>
            </s-section>
        </s-page>
    );
}
