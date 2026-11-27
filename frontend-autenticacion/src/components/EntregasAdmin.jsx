
import { useEffect, useState } from 'react';

function EntregasAdmin({ token }) {
  const [entregas, setEntregas] = useState([]);
  const [observaciones, setObservaciones] = useState({});
  const [estados, setEstados] = useState({});
  const [mensaje, setMensaje] = useState('');

  const cargarEntregas = async () => {
    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/entregas',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setEntregas(datos);
      } else {
        setMensaje(datos.mensaje || 'Error al consultar las entregas');
      }
    } catch {
      setMensaje('No se pudieron cargar las entregas');
    }
  };

  useEffect(() => {
    cargarEntregas();
  }, [token]);

  const calificarEntrega = async (id) => {
    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/entregas/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            estado: estados[id] || 'pendiente',
            observacion: observaciones[id] || ''
          })
        }
      );

      const resultado = await respuesta.json();
      setMensaje(resultado.mensaje);

      if (respuesta.ok) {
        cargarEntregas();
      }
    } catch {
      setMensaje('Error al calificar la entrega');
    }
  };

  const obtenerClaseEstado = (estado) => {
    if (estado === 'aprobada' || estado === 'aprobado') {
      return 'estado-aprobado';
    }

    if (estado === 'rechazada' || estado === 'rechazado') {
      return 'estado-rechazado';
    }

    return 'estado-pendiente';
  };

  return (
    <section className="gestion-entregas">

      <div className="encabezado-entregas">
        <div>
          <span className="etiqueta-seccion">EVALUACIÓN ACADÉMICA</span>
          <h3>Entregas de los aprendices</h3>
          <p>Revisa las respuestas y registra las calificaciones.</p>
        </div>

        <div className="icono-entregas">📝</div>
      </div>

      <div className="resumen-entregas">
        <div className="resumen-item">
          <span>📋</span>
          <div>
            <strong>{entregas.length}</strong>
            <small>Total de entregas</small>
          </div>
        </div>

        <div className="resumen-item pendiente">
          <span>🟠</span>
          <div>
            <strong>
              {entregas.filter(e => e.estado === 'pendiente').length}
            </strong>
            <small>Pendientes</small>
          </div>
        </div>

        <div className="resumen-item aprobado">
          <span>🟢</span>
          <div>
            <strong>
              {entregas.filter(e => e.estado === 'aprobada' || e.estado === 'aprobado').length}
            </strong>
            <small>Aprobadas</small>
          </div>
        </div>

        <div className="resumen-item rechazado">
          <span>🔴</span>
          <div>
            <strong>
              {entregas.filter(e => e.estado === 'rechazada' || e.estado === 'rechazado').length}
            </strong>
            <small>Rechazadas</small>
          </div>
        </div>
      </div>

      {mensaje && (
        <div className="mensaje-actividad">
          {mensaje}
        </div>
      )}

      {entregas.length === 0 ? (
        <div className="sin-actividades">
          <span>📭</span>
          <h4>Aún no hay entregas registradas</h4>
          <p>Cuando los aprendices envíen sus respuestas, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="lista-entregas">
          {entregas.map((entrega) => (
            <article className="tarjeta-entrega" key={entrega.id}>

              <div className="entrega-superior">
                <div>
                  <span className="numero-actividad">
                    ENTREGA #{entrega.id}
                  </span>
                  <h4>{entrega.actividad}</h4>
                </div>

                <span className={`etiqueta-estado ${obtenerClaseEstado(estados[entrega.id] ?? entrega.estado)}`}>
                  {estados[entrega.id] ?? entrega.estado}
                </span>
              </div>

              <div className="datos-entrega">
                <div>
                  <small>APRENDIZ</small>
                  <strong>{entrega.nombre} {entrega.apellidos}</strong>
                </div>
              </div>

              <div className="respuesta-entrega">
                <strong>Respuesta del aprendiz</strong>
                <p>{entrega.respuesta}</p>
              </div>

              <div className="evaluacion-entrega">
                <label>Estado de la entrega</label>

                <select
                  value={estados[entrega.id] ?? entrega.estado}
                  onChange={(e) =>
                    setEstados({
                      ...estados,
                      [entrega.id]: e.target.value
                    })
                  }
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="rechazada">Rechazada</option>
                </select>

                <label>Observación del administrador</label>

                <textarea
                  placeholder="Escribe aquí una observación para el aprendiz..."
                  value={
                    observaciones[entrega.id] ?? entrega.observacion ?? ''
                  }
                  onChange={(e) =>
                    setObservaciones({
                      ...observaciones,
                      [entrega.id]: e.target.value
                    })
                  }
                />

                <button
                  type="button"
                  className="boton-calificar"
                  onClick={() => calificarEntrega(entrega.id)}
                >
                  ✓ Guardar evaluación
                </button>
              </div>

            </article>
          ))}
        </div>
      )}

      <button
        type="button"
        className="boton-actualizar"
        onClick={cargarEntregas}
      >
        ↻ Actualizar entregas
      </button>

    </section>
  );
}

export default EntregasAdmin;
