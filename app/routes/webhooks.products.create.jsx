import { authenticate } from "../shopify.server";
import { createSyncLog } from "../models/syncLog.server";
import { syncProductToERP } from "../services/erp.server";
import { saveProductMapping } from "../models/productMapping.server";

export const action = async ({ request }) => {
    console.log("PRODUCTION WEBHOOK HIT............");
    const { topic, shop, payload } = await authenticate.webhook(request);
    console.log("Success Disha------------Webhook received ....");
    try {
        const erpResponse = await syncProductToERP(payload);
        if (erpResponse.success) {
            await createSyncLog({
                shop,
                topic,
                productId: payload.id?.toString(),
                status: "success",
                payload,
            });
            await saveProductMapping({
                shop,
                shopifyProductId:
                    payload.id.toString(),
                erpProductId:
                    erpResponse.data.erpProductId,
            });

            console.log("ERP sync success");
        } else {
            await createSyncLog({
                shop,
                topic,
                productId: payload.id?.toString(),
                status: "failed",
                payload,
                errorMessage: erpResponse.error,
            });
            console.log("ERP sync failed");
        }
    } catch (error) {
        console.error(error);
    }
    return new Response();
};