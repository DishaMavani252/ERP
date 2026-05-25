import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import { saveShop } from "./models/shop.server";
import { DeliveryMethod } from "@shopify/shopify-api";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.SingleMerchant,
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
  hooks: {
    async afterAuth({ session }) {
      console.log("✅ afterAuth fired for shop:", session.shop);
      console.log("🔑 accessToken present:", !!session.accessToken);

      try {
        await saveShop(session.shop, session.accessToken);
        await shopify.registerWebhooks({ session });
        console.log("✅ saveShop succeeded for:", session.shop);
      } catch (error) {
        console.error("❌ saveShop failed:", error);
      }
    },


  },
  webhooks: {
    PRODUCTS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/products/create",
    },

    PRODUCTS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/products/update",
    },

    PRODUCTS_DELETE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/products/delete",
    },

    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/uninstalled",
    },
  },
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
