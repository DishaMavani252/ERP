// ─────────────────────────────────────────────
// Fake ERP Integration (simulates a real ERP)
// Replace this file when you have a real ERP.
// ─────────────────────────────────────────────

// Called when: Shopify product CREATED
// Simulates sending the product to ERP and getting back an ERP ID
export async function syncProductToERP(product) {
  try {
    const response = await fetch(
      `${process.env.SHOPIFY_APP_URL}/api/erp-sync`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      }
    );
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Called when: Shopify product UPDATED
export async function updateProductInERP({ erpProductId, product }) {
  try {
    console.log("Updating ERP product:", erpProductId);
    const response = await fetch(
      `${process.env.SHOPIFY_APP_URL}/api/erp-sync`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ erpProductId, ...product }),
      }
    );
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Called when: Shopify product DELETED
export async function deleteProductInERP(erpProductId) {
  try {
    console.log("Deleting ERP product:", erpProductId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}