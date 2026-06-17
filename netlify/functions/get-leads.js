// Lee todos los leads enviados al formulario "leads-hdt-newforce" de Netlify Forms
// y los devuelve en formato JSON, listos para que el panel admin los muestre.
//
// Necesita dos variables de entorno configuradas en Netlify (Site settings > Environment variables):
//   NETLIFY_TOKEN    -> Personal Access Token generado en Netlify (User settings > Applications)
//   NETLIFY_SITE_ID  -> ID del sitio (Site settings > General > Site details > Site ID)

exports.handler = async function () {
  try {
    var TOKEN = process.env.NETLIFY_TOKEN;
    var SITE_ID = process.env.NETLIFY_SITE_ID;

    if (!TOKEN || !SITE_ID) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Faltan las variables de entorno NETLIFY_TOKEN y/o NETLIFY_SITE_ID." })
      };
    }

    // 1) Buscar el ID del formulario "leads-hdt-newforce" dentro del sitio
    var formsRes = await fetch("https://api.netlify.com/api/v1/sites/" + SITE_ID + "/forms", {
      headers: { Authorization: "Bearer " + TOKEN }
    });
    if (!formsRes.ok) {
      throw new Error("Error consultando formularios: " + formsRes.status);
    }
    var forms = await formsRes.json();
    var form = forms.find(function (f) { return f.name === "leads-hdt-newforce"; });

    if (!form) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([])
      };
    }

    // 2) Traer todas las submissions de ese formulario
    var subsRes = await fetch("https://api.netlify.com/api/v1/forms/" + form.id + "/submissions?per_page=200", {
      headers: { Authorization: "Bearer " + TOKEN }
    });
    if (!subsRes.ok) {
      throw new Error("Error consultando submissions: " + subsRes.status);
    }
    var submissions = await subsRes.json();

    // 3) Mapear cada submission al formato de lead que usa el panel admin
    var leads = submissions.map(function (s) {
      var d = s.data || {};
      return {
        id: s.id,
        fecha: d.fecha || "",
        nombre: d.nombre || "",
        apellido: d.apellido || "",
        provincia: d.provincia || "",
        localidad: d.localidad || "",
        whatsapp: d.whatsapp || "",
        mail: d.mail || "",
        rubro: d.rubro || "",
        solucion: d.solucion || "",
        aplicacion: d.aplicacion || "",
        equipo: d.equipo || ""
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leads)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
