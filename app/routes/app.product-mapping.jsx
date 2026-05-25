import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import {
    getAllProductMappings,
    getProductMappingsCount,
} from "../models/productMapping.server";

const PAGE_SIZE = 20;

export const loader = async ({ request }) => {
    await authenticate.admin(request);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const skip = (page - 1) * PAGE_SIZE;

    const [mappings, total] = await Promise.all([
        getAllProductMappings({ skip, take: PAGE_SIZE }),
        getProductMappingsCount(),
    ]);

    return {
        mappings: mappings.map((m) => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
            updatedAt: m.updatedAt.toISOString(),
        })),
        page,
        totalPages: Math.ceil(total / PAGE_SIZE),
        total,
    };
};

export default function ProductMappingPage() {
    const { mappings, page, totalPages, total } = useLoaderData();
    const navigate = useNavigate();

    return (
        <s-page heading="Product Mappings">
            <s-section heading={`Shopify ↔ ERP product ID map (${total} total)`}>
                {mappings.length === 0 ? (
                    <s-paragraph>
                        No product mappings yet. Mappings are created automatically when a
                        product is successfully synced to the ERP for the first time
                        (products/create webhook).
                    </s-paragraph>
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
                                <s-text variant="bodyMd" fontWeight="bold" style={{ width: "50px" }}>ID</s-text>
                                <s-text variant="bodyMd" fontWeight="bold" style={{ flex: 1 }}>Shop</s-text>
                                <s-text variant="bodyMd" fontWeight="bold" style={{ flex: 1 }}>Shopify Product ID</s-text>
                                <s-text variant="bodyMd" fontWeight="bold" style={{ flex: 1 }}>ERP Product ID</s-text>
                                <s-text variant="bodyMd" fontWeight="bold" style={{ flex: 1 }}>Created At</s-text>
                            </s-stack>
                        </s-box>

                        {/* Data rows */}
                        {mappings.map((m) => (
                            <s-box
                                key={m.id}
                                padding="tight"
                                borderWidth="base"
                                borderRadius="base"
                            >
                                <s-stack direction="inline" gap="base">
                                    <s-text style={{ width: "50px" }}>{m.id}</s-text>
                                    <s-text style={{ flex: 1 }}>{m.shop}</s-text>
                                    <s-text style={{ flex: 1 }}>{m.shopifyProductId}</s-text>
                                    <s-text style={{ flex: 1 }} tone="success">
                                        {m.erpProductId}
                                    </s-text>
                                    <s-text style={{ flex: 1 }}>
                                        {new Date(m.createdAt).toLocaleString()}
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
                            onClick={() =>
                                navigate(`/app/product-mapping?page=${page - 1}`)
                            }
                        >
                            Previous
                        </s-button>
                        <s-text>
                            Page {page} of {totalPages}
                        </s-text>
                        <s-button
                            disabled={page >= totalPages}
                            onClick={() =>
                                navigate(`/app/product-mapping?page=${page + 1}`)
                            }
                        >
                            Next
                        </s-button>
                    </s-stack>
                )}
            </s-section>

            <s-section slot="aside" heading="About Product Mappings">
                <s-paragraph>
                    When a product is created in Shopify and successfully synced, the ERP
                    assigns it an internal ID. This table tracks the relationship between
                    Shopify product IDs and ERP product IDs.
                </s-paragraph>
                <s-paragraph>
                    This mapping is used to route subsequent update and delete webhooks to
                    the correct ERP record.
                </s-paragraph>
                <s-unordered-list>
                    <s-list-item>
                        <strong>Shopify Product ID</strong> — numeric ID from Shopify
                    </s-list-item>
                    <s-list-item>
                        <strong>ERP Product ID</strong> — assigned by the ERP system (e.g.
                        ERP-12345)
                    </s-list-item>
                </s-unordered-list>
            </s-section>
        </s-page>
    );
}
