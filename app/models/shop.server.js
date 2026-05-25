import prisma from "../db.server";

export async function saveShop(shop, accessToken) {
    return prisma.shop.upsert({
        where: { shop },

        update: {
            accessToken,
        },

        create: {
            shop,
            accessToken,
        },
    });
}