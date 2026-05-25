export async function syncProductToERP(product) {

    try {

        const response = await fetch(
            `${process.env.SHOPIFY_APP_URL}/api/erp-sync`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(product),
            }
        );

        const data = await response.json();

        return {
            success: true,
            data,
        };

    } catch (error) {

        return {
            success: false,
            error: error.message,
        };

    }
}