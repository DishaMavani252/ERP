import {
    getFailedSyncLogs,
    updateSyncLog,
} from "../models/syncLog.server";

import { syncProductToERP } from "./erp.server";

const MAX_RETRIES = 3;

export async function processRetries() {
    const failedLogs = await getFailedSyncLogs(); // already filters retryCount < 3

    let retried = 0;
    let recovered = 0;
    let stillFailing = 0;

    for (const log of failedLogs) {
        console.log(`[RetryWorker] Retrying log id=${log.id} (attempt ${log.retryCount + 1}/${MAX_RETRIES})`);

        const result = await syncProductToERP(log.payload);

        if (result.success) {
            await updateSyncLog(log.id, {
                status: "success",
                processedAt: new Date(),
                errorMessage: null,
            });
            console.log(`[RetryWorker] ✅ Log ${log.id} recovered`);
            recovered++;
        } else {
            const newRetryCount = log.retryCount + 1;
            const exhausted = newRetryCount >= MAX_RETRIES;

            await updateSyncLog(log.id, {
                retryCount: newRetryCount,
                errorMessage: result.error,
                // Mark permanently failed if max retries exhausted
                status: exhausted ? "permanently_failed" : "failed",
            });

            if (exhausted) {
                console.warn(`[RetryWorker] ⛔ Log ${log.id} permanently failed after ${MAX_RETRIES} attempts`);
            } else {
                console.log(`[RetryWorker] ❌ Log ${log.id} still failing (${newRetryCount}/${MAX_RETRIES})`);
            }
            stillFailing++;
        }

        retried++;
    }

    console.log(`[RetryWorker] Done. ${retried} processed, ${recovered} recovered, ${stillFailing} still failing.`);
    return { retried, recovered, stillFailing };
}

