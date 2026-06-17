// netlify/functions/get-leads.js
// Lee los leads directamente desde Netlify Forms API.
// No requiere Blobs — los datos ya están en Netlify Forms.

exports.handler = async function (event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
  const SITE_ID = process.env.NETLIFY_SITE_ID;

  if (!NETLIFY_TOKEN || !SITE_ID) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Faltan variables de entorno: NETLIFY_TOKEN y NETLIFY_SITE_ID." }),
    };
  }

  try {
    // 1. Obtener el ID del formulario "leads-hdt-newforce"
    const formsRes = await fetch(
      `https://api.netlify.com/api/v1/sites/${SITE_ID}/forms`,
      { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
    );
    const forms = await formsRes.json();
    const form = forms.find((f) => f.name === "leads-hdt-newforce");

    if (!form) {
      return { statusCode: 200, headers, body: JSON.stringify([]) };
    }

    // 2. Obtener todas las submissions (hasta 1000)
    const subsRes = await fetch(
      `https://api.netlify.com/api/v1/forms/${form.id}/submissions?per_page=1000`,
      { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
    );
    const submissions = await subsRes.json();

    // 3. Mapear al formato del panel admin
    const leads = submissions.map((s) => ({
      id: s.id,
      fecha: new Date(s.created_at).toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
      }),
      fechaISO: s.created_at,
      nombre: s.data.nombre || "",
      apellido: s.data.apellido || "",
      provincia: s.data.provincia || "",
      localidad: s.data.localidad || "",
      whatsapp: s.data.whatsapp || "",
      mail: s.data.mail || "",
      rubro: s.data.rubro || "",
      solucion: s.data.solucion || "",
      aplicacion: s.data.aplicacion || "",
      equipo: s.data.equipo || "",
    }));

    return { statusCode: 200, headers, body: JSON.stringify(leads) };
  } catch (err) {
    console.error("get-leads error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
