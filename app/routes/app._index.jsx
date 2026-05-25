import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getSyncStats } from "../models/syncLog.server";
import { getProductMappingsCount } from "../models/productMapping.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const [stats, mappingsCount] = await Promise.all([
    getSyncStats(),
    getProductMappingsCount(),
  ]);

  return { stats, mappingsCount };
};

// Trigger manual retry via POST
export const action = async ({ request }) => {
  await authenticate.admin(request);

  const response = await fetch(
    `${process.env.SHOPIFY_APP_URL}/api/retry-sync`,
    { method: "GET" }
  );
  const result = await response.json();
  return { retried: true, result };
};

export default function Dashboard() {
  const { stats, mappingsCount } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const isRetrying =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  // Show toast when retry completes
  if (fetcher.data?.retried && !isRetrying) {
    shopify.toast?.show("Retry job completed");
  }

  const handleRetry = () => fetcher.submit({}, { method: "POST" });

  const successRate =
    stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;

  return (
    <s-page heading="ERP Sync Dashboard">
      <s-button
        slot="primary-action"
        onClick={handleRetry}
        {...(isRetrying ? { loading: true } : {})}
      >
        Retry Failed Syncs
      </s-button>

      {/* ── Stats Row ── */}
      <s-section heading="Sync Overview">
        <s-stack direction="inline" gap="loose">
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="tight">
              <s-heading>Total Events</s-heading>
              <s-text variant="heading2xl">{stats.total}</s-text>
              <s-text tone="subdued">Webhooks received</s-text>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="tight">
              <s-heading>Synced to ERP</s-heading>
              <s-text variant="heading2xl" tone="success">
                {stats.success}
              </s-text>
              <s-text tone="subdued">Successful syncs</s-text>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="tight">
              <s-heading>Failed Syncs</s-heading>
              <s-text
                variant="heading2xl"
                tone={stats.failed > 0 ? "critical" : "success"}
              >
                {stats.failed}
              </s-text>
              <s-text tone="subdued">
                {stats.permanentlyFailed > 0
                  ? `${stats.permanentlyFailed} permanent`
                  : "Need retry"}
              </s-text>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="tight">
              <s-heading>Product Mappings</s-heading>
              <s-text variant="heading2xl">{mappingsCount}</s-text>
              <s-text tone="subdued">Shopify ↔ ERP IDs</s-text>
            </s-stack>
          </s-box>

          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="tight">
              <s-heading>Success Rate</s-heading>
              <s-text
                variant="heading2xl"
                tone={successRate >= 80 ? "success" : "critical"}
              >
                {successRate}%
              </s-text>
              <s-text tone="subdued">Overall health</s-text>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      {/* ── Architecture Overview ── */}
      <s-section heading="Integration Architecture">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            This app connects your Shopify store to your ERP system using a
            real-time, event-driven webhook pipeline. Every product change in
            Shopify is automatically forwarded to the ERP.
          </s-paragraph>
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "13px" }}>
              {`Shopify Store
     ↓  (Product Create / Update / Delete)
Webhook Event
     ↓
Your Shopify App  ←─── OAuth + Session
     ↓
Database Logging  ←─── SyncLog table
     ↓
ERP Sync Service  ←─── Product Mapping
     ↓
ERP System        ←─── External API
     ↓
Retry System      ←─── Auto-recovery (max 3)`}
            </pre>
          </s-box>
        </s-stack>
      </s-section>

      {/* ── Quick Links ── */}
      <s-section slot="aside" heading="Navigation">
        <s-unordered-list>
          <s-list-item>
            <s-link href="/app/sync-logs">View Sync Logs</s-link>
          </s-list-item>
          <s-list-item>
            <s-link href="/app/product-mapping">View Product Mappings</s-link>
          </s-list-item>
        </s-unordered-list>
      </s-section>

      {/* ── Webhook Topics ── */}
      <s-section slot="aside" heading="Registered Webhooks">
        <s-unordered-list>
          <s-list-item>products/create</s-list-item>
          <s-list-item>products/update</s-list-item>
          <s-list-item>products/delete</s-list-item>
          <s-list-item>app/uninstalled</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};


