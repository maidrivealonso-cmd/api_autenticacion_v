
import { useEffect, useState } from 'react';

function ActividadesAprendiz({ token }) {
  const [actividades, setActividades] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [archivosSeleccionados, setArchivosSeleccionados] = useState({});
  const [misEntregas, setMisEntregas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargarActividades = async () => {
    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/actividades',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setActividades(datos);
      } else {
        setMensaje(datos.mensaje || 'Error al cargar actividades');
      }
    } catch {
      setMensaje('No se pudieron cargar las actividades');
    }
  };

  const cargarMisEntregas = async () => {
    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/mis-entregas',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMisEntregas(datos);
      } else {
        setMensaje(datos.mensaje || 'Error al consultar tus entregas');
      }
    } catch {
      setMensaje('No se pudieron consultar tus entregas');
    }
  };

  useEffect(() => {
    cargarActividades();
    cargarMisEntregas();
  }, [token]);

  const seleccionarArchivos = (idActividad, lista) => {
    const archivos = Array.from(lista);

    if (archivos.length > 5) {
      setMensaje('Solo puedes adjuntar hasta 5 archivos');
      return;
    }

    const tamanoMaximo = 10 * 1024 * 1024;

    const extensionesPermitidas = [
      'pdf', 'doc', 'docx', 'xls', 'xlsx',
      'ppt', 'pptx', 'jpg', 'jpeg', 'png',
      'webp', 'txt'
    ];

    for (const archivo of archivos) {
      const extension = archivo.name.split('.').pop().toLowerCase();

      if (!extensionesPermitidas.includes(extension)) {
        setMensaje(`El archivo ${archivo.name} no tiene un formato permitido`);
        return;
      }

      if (archivo.size > tamanoMaximo) {
        setMensaje(`El archivo ${archivo.name} supera los 10 MB`);
        return;
      }
    }

    setArchivosSeleccionados((anteriores) => ({
      ...anteriores,
      [idActividad]: archivos
    }));

    setMensaje('');
  };

  const enviarEntrega = async (idActividad) => {
    const respuestaAprendiz = respuestas[idActividad] || '';
    const archivos = archivosSeleccionados[idActividad] || [];

    if (!respuestaAprendiz.trim() && archivos.length === 0) {
      setMensaje('Escribe una respuesta o adjunta al menos un archivo');
      return;
    }

    const formulario = new FormData();

    formulario.append('id_actividad', idActividad);
    formulario.append('respuesta', respuestaAprendiz);

    archivos.forEach((archivo) => {
      formulario.append('archivos', archivo);
    });

    try {
      setEnviando(true);
      setMensaje('');

      const respuesta = await fetch(
        'http://localhost:3000/api/entregas',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formulario
        }
      );

      const resultado = await respuesta.json();
      setMensaje(resultado.mensaje);

      if (respuesta.ok) {
        setRespuestas((anteriores) => ({
          ...anteriores,
          [idActividad]: ''
        }));

        setArchivosSeleccionados((anteriores) => ({
          ...anteriores,
          [idActividad]: []
        }));

        await cargarMisEntregas();
      }
    } catch {
      setMensaje('Error de conexión con el servidor');
    } finally {
      setEnviando(false);
    }
  };

  const descargarArchivo = async (idEntrega, archivoId, nombre) => {
    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/entregas/${idEntrega}/archivos/${archivoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!respuesta.ok) {
        setMensaje('No se pudo descargar el archivo');
        return;
      }

      const archivo = await respuesta.blob();
      const url = window.URL.createObjectURL(archivo);
      const enlace = document.createElement('a');

      enlace.href = url;
      enlace.download = nombre;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      setMensaje('Error al descargar el archivo');
    }
  };

  return (
    <section>
      <h3>Actividades disponibles</h3>

      {mensaje && <p>{mensaje}</p>}

      {actividades.length === 0 ? (
        <p>No hay actividades registradas por el momento.</p>
      ) : (
        actividades.map((actividad) => (
          <article key={actividad.id}>
            <h4>{actividad.titulo}</h4>

            <p>{actividad.descripcion}</p>

            <p>
              <strong>Fecha límite:</strong>{' '}
              {String(actividad.fecha_limite).substring(0, 10)}
            </p>

            <textarea
              placeholder="Escribe aquí tu respuesta..."
              value={respuestas[actividad.id] || ''}
              onChange={(e) =>
                setRespuestas({
                  ...respuestas,
                  [actividad.id]: e.target.value
                })
              }
            />

            <div className="selector-archivos">
              <label>
                Adjuntar documentos o fotografías
              </label>

              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.txt"
                onChange={(e) =>
                  seleccionarArchivos(actividad.id, e.target.files)
                }
              />

              {archivosSeleccionados[actividad.id]?.length > 0 && (
                <div>
                  <p>Archivos seleccionados:</p>

                  {archivosSeleccionados[actividad.id].map((archivo, indice) => (
                    <p key={`${archivo.name}-${indice}`}>
                      <span>📎 {archivo.name}</span>
                    </p>
                  ))}
                </div>
              )}

              <small>
                Máximo 5 archivos de 10 MB cada uno.
              </small>
            </div>

            <button
              type="button"
              disabled={enviando}
              onClick={() => enviarEntrega(actividad.id)}
            >
              {enviando ? 'Enviando...' : 'Enviar actividad'}
            </button>
          </article>
        ))
      )}

      <hr />

      <h3>Mis entregas y calificaciones</h3>

      {misEntregas.length === 0 ? (
        <p>Aún no has enviado actividades.</p>
      ) : (
        misEntregas.map((entrega) => (
          <article key={entrega.id}>
            <h4>{entrega.actividad}</h4>

            <p>
              <strong>Mi respuesta:</strong>{' '}
              {entrega.respuesta || 'Entrega con archivos adjuntos'}
            </p>

            <p>
              <strong>Estado:</strong> {entrega.estado}
            </p>

            <p>
              <strong>Observación del administrador:</strong>{' '}
              {entrega.observacion || 'Aún no hay observaciones.'}
            </p>

            {entrega.archivos?.length > 0 && (
              <div>
                <strong>Mis archivos adjuntos:</strong>

                {entrega.archivos.map((archivo) => (
                  <p key={archivo.id}>
                    📎 {archivo.nombre_original}{' '}
                    <button
                      type="button"
                      onClick={() =>
                        descargarArchivo(
                          entrega.id,
                          archivo.id,
                          archivo.nombre_original
                        )
                      }
                    >
                      Descargar
                    </button>
                  </p>
                ))}
              </div>
            )}
          </article>
        ))
      )}

      <button type="button" onClick={cargarMisEntregas}>
        Actualizar mis calificaciones
      </button>
    </section>
  );
}

export default ActividadesAprendiz;
