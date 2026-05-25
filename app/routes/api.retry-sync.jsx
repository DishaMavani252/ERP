import { processRetries } from "../services/retryWorker.server";

export const loader = async () => {
    const result = await processRetries();
    return Response.json({ success: true, ...result });
};
