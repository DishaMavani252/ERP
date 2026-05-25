import prisma from "../db.server";

export async function saveProductMapping({
    shop,
    shopifyProductId,
    erpProductId,
}) {
    return prisma.productMapping.upsert({
        where: { shopifyProductId },
        update: { erpProductId },
        create: { shop, shopifyProductId, erpProductId },
    });
}

export async function getProductMapping(shopifyProductId) {
    return prisma.productMapping.findUnique({
        where: { shopifyProductId },
    });
}

export async function deleteProductMapping({ shopifyProductId }) {
    return prisma.productMapping.delete({
        where: { shopifyProductId },
    });
}

// List all mappings, newest first
export async function getAllProductMappings({ skip = 0, take = 20 } = {}) {
    return prisma.productMapping.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take,
    });
}

export async function getProductMappingsCount() {
    return prisma.productMapping.count();
}