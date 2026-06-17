// Borra submissions del formulario de Netlify Forms a partir de una lista de IDs.
// Se usa desde el botón "Borrar registros de prueba" del panel admin para que
// el borrado sea real (no solo local) y no vuelvan a aparecer al actualizar.
//
// Necesita la variable de entorno NETLIFY_TOKEN (Personal Access Token).

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    var TOKEN = process.env.NETLIFY_TOKEN;
    if (!TOKEN) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Falta la variable de entorno NETLIFY_TOKEN." })
      };
    }

    var body = JSON.parse(event.body || "{}");
    var ids = Array.isArray(body.ids) ? body.ids : [];

    var results = [];
    for (var i = 0; i < ids.length; i++) {
      var res = await fetch("https://api.netlify.com/api/v1/submissions/" + ids[i], {
        method: "DELETE",
        headers: { Authorization: "Bearer " + TOKEN }
      });
      results.push({ id: ids[i], ok: res.ok });
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: results })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
