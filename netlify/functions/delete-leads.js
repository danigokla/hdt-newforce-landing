// netlify/functions/delete-leads.js
// Borra leads desde Netlify Forms API por ID de submission.

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;

  if (!NETLIFY_TOKEN) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Falta variable de entorno: NETLIFY_TOKEN." }),
    };
  }

  try {
    const { ids } = JSON.parse(event.body);
    if (!Array.isArray(ids) || ids.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "No se recibieron IDs." }) };
    }

    // Netlify Forms API: DELETE /api/v1/submissions/{submission_id}
    const results = await Promise.all(
      ids.map((id) =>
        fetch(`https://api.netlify.com/api/v1/submissions/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` },
        })
      )
    );

    const failed = results.filter((r) => !r.ok).length;
    if (failed > 0) {
      return {
        statusCode: 207,
        headers,
        body: JSON.stringify({ ok: false, message: `${failed} eliminaciones fallaron.` }),
      };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, deleted: ids.length }) };
  } catch (err) {
    console.error("delete-leads error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
