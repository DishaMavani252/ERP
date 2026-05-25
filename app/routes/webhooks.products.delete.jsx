import { authenticate } from "../shopify.server";
import { getProductMapping } from "../models/productMapping.server";
import { createSyncLog } from "../models/syncLog.server";
import { deleteProductInERP } from "../services/erp.server";

export const action = async ({ request }) => {
    const { topic, shop, payload } =
        await authenticate.webhook(request);

    try {
        const mapping = await getProductMapping(payload.id.toString());

        if (!mapping) {
            return new Response();
        }

        const erpResponse = await deleteProductInERP(mapping.erpProductId);

        await createSyncLog({
            shop,
            topic,
            productId: payload.id.toString(),
            status: erpResponse.success ? "success" : "failed",
            payload,
            errorMessage: erpResponse.error || null,
        });

        console.log("Product delete synced");
    } catch (error) {
        console.error(error);
    }

    return new Response();
};
