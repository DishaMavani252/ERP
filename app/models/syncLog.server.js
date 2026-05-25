import prisma from "../db.server";

export async function createSyncLog(data) {
    return prisma.syncLog.create({
        data,
    });
}

export async function getFailedSyncLogs() {
    return prisma.syncLog.findMany({
        where: {
            status: "failed",
            retryCount: {
                lt: 3,
            },
        },
    });
}

export async function updateSyncLog(id, data) {
    return prisma.syncLog.update({
        where: { id },
        data,
    });
}

// Returns totals: total, success, failed, pending
export async function getSyncStats() {
    const [total, success, failed, permanentlyFailed] = await Promise.all([
        prisma.syncLog.count(),
        prisma.syncLog.count({ where: { status: "success" } }),
        prisma.syncLog.count({ where: { status: "failed" } }),
        prisma.syncLog.count({ where: { status: "permanently_failed" } }),
    ]);
    return {
        total,
        success,
        failed: failed + permanentlyFailed,
        permanentlyFailed,
        pending: total - success - failed - permanentlyFailed,
    };
}

// Paginated sync logs, newest first
export async function getAllSyncLogs({ skip = 0, take = 20 } = {}) {
    return prisma.syncLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take,
    });
}

export async function getSyncLogsCount() {
    return prisma.syncLog.count();
}