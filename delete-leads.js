// netlify/functions/delete-leads.js
// Borra leads específicos (por ID) desde el panel admin.

const { getStore } = require("@netlify/blobs");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { ids } = JSON.parse(event.body);
    if (!Array.isArray(ids) || ids.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "No se recibieron IDs." }) };
    }

    const store = getStore("leads");
    await Promise.all(ids.map((id) => store.delete(id)));

    return { statusCode: 200, body: JSON.stringify({ ok: true, deleted: ids.length }) };
  } catch (err) {
    console.error("delete-leads error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
