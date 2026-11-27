

import { useEffect, useState } from 'react';

function Actividades({ token }) {
  const [actividades, setActividades] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const cargarActividades = async () => {
    try {
      const respuesta = await fetch('http://localhost:3000/api/actividades', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

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

  useEffect(() => {
    cargarActividades();
  }, [token]);

  const guardarActividad = async (e) => {
    e.preventDefault();
    setMensaje('');

    const datos = {
      titulo,
      descripcion,
      fecha_limite: fechaLimite
    };

    try {
      const respuesta = await fetch(
        editando
          ? `http://localhost:3000/api/actividades/${editando}`
          : 'http://localhost:3000/api/actividades',
        {
          method: editando ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(datos)
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(resultado.mensaje || 'No se pudo guardar la actividad');
        return;
      }

      setMensaje(resultado.mensaje);
      limpiarFormulario();
      cargarActividades();
    } catch {
      setMensaje('Error de conexión con el servidor');
    }
  };

  const prepararEdicion = (actividad) => {
    setEditando(actividad.id);
    setTitulo(actividad.titulo);
    setDescripcion(actividad.descripcion);
    setFechaLimite(actividad.fecha_limite.substring(0, 10));
    setMensaje('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarActividad = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta actividad?')) {
      return;
    }

    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/actividades/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const resultado = await respuesta.json();
      setMensaje(resultado.mensaje);

      if (respuesta.ok) {
        cargarActividades();
      }
    } catch {
      setMensaje('No se pudo eliminar la actividad');
    }
  };

  const limpiarFormulario = () => {
    setTitulo('');
    setDescripcion('');
    setFechaLimite('');
    setEditando(null);
  };

  return (
    <section className="gestion-actividades">
      <div className="encabezado-actividades">
        <div>
          <span className="etiqueta-seccion">ADMINISTRACIÓN</span>
          <h3>Gestión de actividades</h3>
          <p>Crea y administra las actividades de los aprendices.</p>
        </div>

        <div className="icono-actividades">📚</div>
      </div>

      <div className="formulario-actividad">
        <h3>{editando ? '✏️ Editar actividad' : '＋ Nueva actividad'}</h3>

        <form onSubmit={guardarActividad}>
          <label>Título de la actividad</label>
          <input
            type="text"
            placeholder="Ej. Actividad de programación"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />

          <label>Descripción</label>
          <textarea
            placeholder="Escribe las instrucciones de la actividad..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />

          <label>Fecha límite de entrega</label>
          <input
            type="date"
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
            required
          />

          <div className="acciones-formulario">
            <button type="submit">
              {editando ? 'Guardar cambios' : '＋ Crear actividad'}
            </button>

            {editando && (
              <button
                type="button"
                className="boton-cancelar"
                onClick={limpiarFormulario}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {mensaje && (
        <div className="mensaje-actividad">
          {mensaje}
        </div>
      )}

      <div className="titulo-lista-actividades">
        <div>
          <h3>Actividades registradas</h3>
          <p>Consulta y administra las actividades creadas.</p>
        </div>

        <span className="contador-actividades">
          {actividades.length} {actividades.length === 1 ? 'actividad' : 'actividades'}
        </span>
      </div>

      {actividades.length === 0 ? (
        <div className="sin-actividades">
          <span>📋</span>
          <h4>No hay actividades todavía</h4>
          <p>Cuando crees una actividad, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="lista-actividades">
          {actividades.map((actividad) => (
            <article className="tarjeta-actividad" key={actividad.id}>
              <div className="actividad-superior">
                <span className="numero-actividad">
                  ACTIVIDAD #{actividad.id}
                </span>
                <span className="estado-actividad">Registrada</span>
              </div>

              <h4>{actividad.titulo}</h4>

              <p className="descripcion-actividad">
                {actividad.descripcion}
              </p>

              <div className="fecha-actividad">
                <span>📅</span>
                <div>
                  <small>Fecha límite de entrega</small>
                  <strong>
                    {String(actividad.fecha_limite).substring(0, 10)}
                  </strong>
                </div>
              </div>

              <div className="botones-actividad">
                <button
                  type="button"
                  className="boton-editar"
                  onClick={() => prepararEdicion(actividad)}
                >
                  ✏️ Editar
                </button>

                <button
                  type="button"
                  className="boton-eliminar"
                  onClick={() => eliminarActividad(actividad.id)}
                >
                  🗑 Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Actividades;
