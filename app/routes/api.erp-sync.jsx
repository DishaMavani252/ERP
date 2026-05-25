export const action = async ({ request }) => {
    const method = request.method;
    const body = await request.json();

    if (method === "POST") {
        console.log("ERP received product (CREATE)");
        console.log(body);
        return Response.json({
            success: true,
            erpProductId: `ERP-${body.id}`,
        });
    }

    if (method === "PUT") {
        console.log("ERP received product (UPDATE)");
        console.log(body);
        return Response.json({
            success: true,
            erpProductId: body.erpProductId,
        });
    }

    if (method === "DELETE") {
        console.log("ERP received product (DELETE)");
        console.log(body);
        return Response.json({
            success: true,
            deleted: true,
            erpProductId: body.erpProductId,
        });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405 });
};