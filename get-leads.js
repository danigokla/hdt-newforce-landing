// netlify/functions/get-leads.js
// Lee todos los leads guardados en Netlify Blobs (almacenamiento serverless de Netlify).

const { getStore } = require("@netlify/blobs");

exports.handler = async function (event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const store = getStore("leads");
    const { blobs } = await store.list();

    const leads = await Promise.all(
      blobs.map(async (blob) => {
        const data = await store.get(blob.key, { type: "json" });
        return { id: blob.key, ...data };
      })
    );

    // Ordenar por fecha descendente
    leads.sort((a, b) => new Date(b.fechaISO || 0) - new Date(a.fechaISO || 0));

    return { statusCode: 200, headers, body: JSON.stringify(leads) };
  } catch (err) {
    console.error("get-leads error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "No se pudieron cargar los leads." }),
    };
  }
};
