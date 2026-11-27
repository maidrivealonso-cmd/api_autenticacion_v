
import { useEffect, useState } from 'react';

function ActividadesAprendiz({ token }) {
  const [actividades, setActividades] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [misEntregas, setMisEntregas] = useState([]);
  const [mensaje, setMensaje] = useState('');

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

  const enviarEntrega = async (idActividad) => {
    const respuestaAprendiz = respuestas[idActividad];

    if (!respuestaAprendiz || !respuestaAprendiz.trim()) {
      setMensaje('Escribe tu respuesta antes de enviarla');
      return;
    }

    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/entregas',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            id_actividad: idActividad,
            respuesta: respuestaAprendiz
          })
        }
      );

      const resultado = await respuesta.json();
      setMensaje(resultado.mensaje);

      if (respuesta.ok) {
        setRespuestas((anteriores) => ({
          ...anteriores,
          [idActividad]: ''
        }));

        cargarMisEntregas();
      }
    } catch {
      setMensaje('Error de conexión con el servidor');
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

            <button
              type="button"
              onClick={() => enviarEntrega(actividad.id)}
            >
              Enviar actividad
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
              <strong>Mi respuesta:</strong> {entrega.respuesta}
            </p>

            <p>
              <strong>Estado:</strong> {entrega.estado}
            </p>

            <p>
              <strong>Observación del administrador:</strong>{' '}
              {entrega.observacion || 'Aún no hay observaciones.'}
            </p>
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
