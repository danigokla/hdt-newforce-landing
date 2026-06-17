// netlify/functions/save-lead.js
// Se ejecuta automáticamente cada vez que Netlify Forms recibe un nuevo lead.
// Guarda el lead en Netlify Blobs para que el panel admin pueda leerlo desde cualquier dispositivo.

const { getStore } = require("@netlify/blobs");

exports.handler = async function (event, context) {
  // Netlify invoca esta función con el payload del formulario
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const payload = JSON.parse(event.body);

    // Netlify Forms envuelve los datos en payload.data
    const data = payload.data || payload;

    const now = new Date();
    const lead = {
      fecha: new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }),
      fechaISO: now.toISOString(),
      nombre: data.nombre || "",
      apellido: data.apellido || "",
      provincia: data.provincia || "",
      localidad: data.localidad || "",
      whatsapp: data.whatsapp || "",
      mail: data.mail || "",
      rubro: data.rubro || "",
      solucion: data.solucion || "",
      aplicacion: data.aplicacion || "",
      equipo: data.equipo || "",
    };

    const store = getStore("leads");
    // Clave única: timestamp + mail para evitar duplicados
    const key = `${now.getTime()}_${(lead.mail || "noemail").replace(/[^a-z0-9]/gi, "_")}`;
    await store.setJSON(key, lead);

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("save-lead error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
