
import { useState } from 'react';
import './App.css';
import Actividades from './components/Actividades';
import ActividadesAprendiz from './components/ActividadesAprendiz';
import EntregasAdmin from './components/EntregasAdmin';

function App() {
  const [modo, setModo] = useState('registro');

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [sesion, setSesion] = useState(null);
  const [token, setToken] = useState('');
  const [aprendices, setAprendices] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cerrarSesion = () => {
    setSesion(null);
    setToken('');
    setAprendices([]);
    setUsuario('');
    setPassword('');
    setMensaje('');
    setModo('login');
    localStorage.removeItem('token');
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (modo === 'registro' && password !== confirmarPassword) {
      setMensaje('Las contraseñas no coinciden');
      return;
    }

    const datos = modo === 'registro'
      ? {
          nombre,
          apellidos,
          fecha_nacimiento: fechaNacimiento,
          correo,
          telefono,
          usuario,
          password
        }
      : { usuario, password };

    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/${modo}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datos)
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(resultado.mensaje || 'Ocurrió un error');
        return;
      }

      if (modo === 'registro') {
        setMensaje(resultado.mensaje);
        setNombre('');
        setApellidos('');
        setFechaNacimiento('');
        setCorreo('');
        setTelefono('');
        setUsuario('');
        setPassword('');
        setConfirmarPassword('');
        return;
      }

      if (!resultado.token || !resultado.usuario) {
        setMensaje('El servidor no devolvió los datos de sesión');
        return;
      }

      setToken(resultado.token);
      setSesion(resultado.usuario);
      localStorage.setItem('token', resultado.token);

      if (resultado.usuario.rol === 'admin') {
        setCargando(true);

        const respuestaUsuarios = await fetch(
          'http://localhost:3000/api/usuarios',
          {
            headers: {
              Authorization: `Bearer ${resultado.token}`
            }
          }
        );

        const datosUsuarios = await respuestaUsuarios.json();

        if (respuestaUsuarios.ok) {
          setAprendices(datosUsuarios.usuarios);
        } else {
          setMensaje(datosUsuarios.mensaje || 'No se pudo cargar la tabla');
        }

        setCargando(false);
      }

    } catch (error) {
      setCargando(false);
      setMensaje('No se pudo conectar con el servidor');
    }
  };

  // PANEL DEL ADMINISTRADOR
  if (sesion && sesion.rol === 'admin') {
    return (
      <div className="panel-principal">

        <header className="barra-superior">
          <div className="marca-sistema">
            <div className="marca-icono">📘</div>
            <div>
              <h1>Gestión Académica</h1>
              <span>Panel administrativo</span>
            </div>
          </div>

          <div className="usuario-superior">
            <div className="avatar-usuario">A</div>
            <div className="datos-superior">
              <strong>{sesion.usuario}</strong>
              <small>Administrador</small>
            </div>
            <button className="boton-salir" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="contenido-panel">
          <div className="bienvenida-panel">
            <span className="etiqueta-seccion">ADMINISTRACIÓN DEL SISTEMA</span>
            <h2>¡Bienvenido, {sesion.usuario}!</h2>
            <p>Desde aquí puedes administrar aprendices, actividades y entregas.</p>
          </div>

          <div className="tarjeta-seccion">
            <div className="titulo-seccion-panel">
              <div>
                <h3>👥 Listado de aprendices</h3>
                <p>Consulta los usuarios registrados en el sistema.</p>
              </div>
              <span className="contador-actividades">
                {aprendices.length} aprendices
              </span>
            </div>

            {cargando ? (
              <p>Cargando aprendices...</p>
            ) : (
              <div className="tabla-contenedor">
                <table>
                  <thead>
                    <tr>
                      {['ID', 'Nombre', 'Apellidos', 'Correo', 'Teléfono', 'Usuario', 'Rol'].map((titulo) => (
                        <th key={titulo}>{titulo}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {aprendices.map((persona) => (
                      <tr key={persona.id}>
                        <td>{persona.id}</td>
                        <td>{persona.nombre}</td>
                        <td>{persona.apellidos}</td>
                        <td>{persona.correo}</td>
                        <td>{persona.telefono}</td>
                        <td>{persona.usuario}</td>
                        <td>
                          <span className="etiqueta-rol">{persona.rol}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {aprendices.length === 0 && (
                  <p>No hay aprendices registrados.</p>
                )}
              </div>
            )}
          </div>

          <div className="tarjeta-seccion">
            <Actividades token={token} />
          </div>

          <div className="tarjeta-seccion">
            <EntregasAdmin token={token} />
          </div>

          {mensaje && <div className="mensaje-actividad">{mensaje}</div>}
        </main>

        <footer className="pie-pagina">
          Sistema de Gestión Académica
        </footer>
      </div>
    );
  }

  // PANEL DEL APRENDIZ
  if (sesion && sesion.rol === 'aprendiz') {
    return (
      <div className="panel-principal">

        <header className="barra-superior">
          <div className="marca-sistema">
            <div className="marca-icono">📘</div>
            <div>
              <h1>Gestión Académica</h1>
              <span>Panel del aprendiz</span>
            </div>
          </div>

          <div className="usuario-superior">
            <div className="avatar-usuario">
              {sesion.usuario.charAt(0).toUpperCase()}
            </div>
            <div className="datos-superior">
              <strong>{sesion.usuario}</strong>
              <small>Aprendiz</small>
            </div>
            <button className="boton-salir" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="contenido-panel">

          <div className="bienvenida-panel tarjeta-bienvenida-aprendiz">
            <span className="etiqueta-seccion">MI ESPACIO ACADÉMICO</span>
            <h2>¡Hola, {sesion.usuario}! 👋</h2>
            <p>Bienvenido a tu panel de control. Aquí puedes consultar y entregar tus actividades.</p>

            <div className="datos-aprendiz">
              <div>
                <small>IDENTIFICACIÓN</small>
                <strong>{sesion.id}</strong>
              </div>

              <div>
                <small>USUARIO</small>
                <strong>{sesion.usuario}</strong>
              </div>

              <div>
                <small>ROL</small>
                <strong>Aprendiz</strong>
              </div>
            </div>
          </div>

          <div className="tarjeta-seccion">
            <ActividadesAprendiz token={token} />
          </div>

        </main>

        <footer className="pie-pagina">
          Sistema de Gestión Académica
        </footer>
      </div>
    );
  }

  // REGISTRO E INICIO DE SESIÓN
  return (
    <div className="pantalla-autenticacion">

      <div className="presentacion-login">
        <div className="logo-login">📘</div>
        <h1>Gestión Académica</h1>
        <p>Un espacio para administrar actividades, entregas y aprendizaje.</p>
        <div className="decoracion-login">✦</div>
      </div>

      <div className="contenedor contenedor-login">

        <div className="botones">
          <button
            type="button"
            className={modo === 'registro' ? 'boton-seleccionado' : 'boton-secundario'}
            onClick={() => {
              setModo('registro');
              setMensaje('');
            }}
          >
            Crear cuenta
          </button>

          <button
            type="button"
            className={modo === 'login' ? 'boton-seleccionado' : 'boton-secundario'}
            onClick={() => {
              setModo('login');
              setMensaje('');
            }}
          >
            Iniciar sesión
          </button>
        </div>

        <div className="titulo-login">
          <h2>{modo === 'registro' ? 'Crear una cuenta' : '¡Qué bueno tenerte de vuelta!'}</h2>
          <p>
            {modo === 'registro'
              ? 'Completa tus datos para registrarte.'
              : 'Ingresa tus datos para acceder al sistema.'}
          </p>
        </div>

        <form onSubmit={manejarEnvio}>

          {modo === 'registro' && (
            <>
              <label>Nombres</label>
              <input
                type="text"
                placeholder="Escribe tus nombres"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />

              <label>Apellidos</label>
              <input
                type="text"
                placeholder="Escribe tus apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                required
              />

              <label>Fecha de nacimiento</label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                required
              />

              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />

              <label>Número de celular</label>
              <input
                type="tel"
                placeholder="Tu número de celular"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </>
          )}

          <label>Usuario</label>
          <input
            type="text"
            placeholder="Escribe tu usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Escribe tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {modo === 'registro' && (
            <>
              <label>Confirmar contraseña</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
              />
            </>
          )}

          <button type="submit" className="boton-ingresar">
            {modo === 'registro' ? 'Crear mi cuenta' : 'Ingresar al sistema'}
          </button>
        </form>

        {mensaje && <div className="mensaje-actividad">{mensaje}</div>}

        <p className="texto-seguridad">
          Sistema de acceso seguro por usuario y contraseña.
        </p>
      </div>

      <footer className="pie-login">
        Sistema de Gestión Académica
      </footer>
    </div>
  );
}

export default App;
