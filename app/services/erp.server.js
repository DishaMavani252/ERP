// ─────────────────────────────────────────────
// Real ERP Integration
// Set in your .env:
//   ERP_API_URL=https://your-erp.com/api
//   ERP_API_KEY=your-secret-key
// ─────────────────────────────────────────────

const ERP_BASE_URL = process.env.ERP_API_URL;
const ERP_API_KEY = process.env.ERP_API_KEY;

function erpHeaders() {
  return {
    "Content-Type": "application/json",
    // ↓ Change this header name to whatever your ERP expects
    "Authorization": `Bearer ${ERP_API_KEY}`,
  };
}

// Called when: Shopify product CREATED
// ERP action : create a new product record
export async function syncProductToERP(product) {
  try {
    const response = await fetch(`${ERP_BASE_URL}/products`, {
      method: "POST",
      headers: erpHeaders(),
      // ↓ Map Shopify fields → ERP fields your system expects
      body: JSON.stringify({
        name: product.title,
        description: product.body_html,
        sku: product.variants?.[0]?.sku || "",
        price: product.variants?.[0]?.price || "0.00",
        vendor: product.vendor,
        shopify_id: product.id?.toString(),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `ERP ${response.status}: ${err}` };
    }

    const data = await response.json();

    // ↓ Your ERP must return something we can store as erpProductId
    //   e.g. data.id, data.product_id, data.erpId — change as needed
    return { success: true, data: { erpProductId: data.id } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Called when: Shopify product UPDATED
// ERP action : update the existing ERP product record
export async function updateProductInERP({ erpProductId, product }) {
  try {
    const response = await fetch(`${ERP_BASE_URL}/products/${erpProductId}`, {
      method: "PUT",
      headers: erpHeaders(),
      // ↓ Map fields the same way as create above
      body: JSON.stringify({
        name: product.title,
        description: product.body_html,
        sku: product.variants?.[0]?.sku || "",
        price: product.variants?.[0]?.price || "0.00",
        vendor: product.vendor,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `ERP ${response.status}: ${err}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Called when: Shopify product DELETED
// ERP action : delete the product from ERP
export async function deleteProductInERP(erpProductId) {
  try {
    const response = await fetch(`${ERP_BASE_URL}/products/${erpProductId}`, {
      method: "DELETE",
      headers: erpHeaders(),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `ERP ${response.status}: ${err}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}