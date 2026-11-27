
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

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  const nombreCompleto = sesion
    ? `${sesion.nombre || ''} ${sesion.apellidos || ''}`.trim() || sesion.usuario
    : '';

  const inicial = sesion
    ? (sesion.nombre || sesion.usuario || 'U').charAt(0).toUpperCase()
    : 'U';

  const irA = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    setMenuAbierto(false);
  };

  const cerrarSesion = () => {
    setSesion(null);
    setToken('');
    setAprendices([]);
    setUsuario('');
    setPassword('');
    setMensaje('');
    setModo('login');
    setMenuAbierto(false);
    setPerfilAbierto(false);
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

  // MENÚ LATERAL
  const menuLateral = (esAdmin) => (
    <aside className={`menu-lateral ${menuAbierto ? 'menu-visible' : ''}`}>
      <div className="logo-sena">
        <div className="logo-sena-icono">S</div>
        <div>
          <h2>SENA</h2>
          <span>Gestión Académica</span>
        </div>
      </div>

      <div className="menu-etiqueta">MENÚ PRINCIPAL</div>

      <nav className="navegacion-lateral">
        <button onClick={() => irA('inicio')} className="opcion-menu activa">
          <span>⌂</span> Inicio
        </button>

        {esAdmin ? (
          <>
            <button onClick={() => irA('aprendices')} className="opcion-menu">
              <span>♙</span> Aprendices
            </button>

            <button onClick={() => irA('actividades')} className="opcion-menu">
              <span>▤</span> Actividades
            </button>

            <button onClick={() => irA('entregas')} className="opcion-menu">
              <span>☷</span> Entregas
            </button>
          </>
        ) : (
          <>
            <button onClick={() => irA('actividades')} className="opcion-menu">
              <span>▤</span> Mis cursos
            </button>

            <button onClick={() => irA('entregas')} className="opcion-menu">
              <span>☷</span> Mis entregas
            </button>

            <button onClick={() => irA('perfil')} className="opcion-menu">
              <span>♙</span> Mi perfil
            </button>
          </>
        )}
      </nav>

      <div className="menu-inferior">
        <div className="mensaje-sena">
          <strong>SENA</strong>
          <p>Más trabajo, más oportunidades.</p>
        </div>

        <button className="opcion-menu opcion-salir" onClick={cerrarSesion}>
          <span>⇥</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );

  // ENCABEZADO
  const encabezado = (subtitulo) => (
    <header className="encabezado-principal">
      <div className="encabezado-izquierda">
        <button
          className="boton-menu-movil"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <div>
          <h1>Gestión Académica</h1>
          <p>{subtitulo}</p>
        </div>
      </div>

      <div className="encabezado-derecha">
        <div className="perfil-encabezado">
          <button
            className="perfil-boton"
            onClick={() => setPerfilAbierto(!perfilAbierto)}
          >
            <div className="avatar-usuario">{inicial}</div>

            <div className="perfil-datos">
              <strong>{sesion.usuario}</strong>
              <span>{sesion.rol === 'admin' ? 'Administrador' : 'Aprendiz'}</span>
            </div>

            <span className="flecha-perfil">⌄</span>
          </button>

          {perfilAbierto && (
            <div className="menu-perfil">
              <button onClick={() => irA(sesion.rol === 'admin' ? 'aprendices' : 'perfil')}>
                Mi información
              </button>
              <button onClick={cerrarSesion}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  // PANEL DEL ADMINISTRADOR
  if (sesion && sesion.rol === 'admin') {
    return (
      <div className="aplicacion">
        {menuLateral(true)}

        <div className="contenido-principal">
          {encabezado('Panel administrativo')}

          <main className="contenido-dashboard">
            <section className="banner-bienvenida" id="inicio">
              <div>
                <span className="texto-pequeno">PANEL DE ADMINISTRACIÓN</span>
                <h2>¡Bienvenido, {nombreCompleto}!</h2>
                <p>
                  Administra aprendices, actividades y entregas desde un solo lugar.
                </p>
              </div>

              <div className="banner-icono">📚</div>
            </section>

            <section className="resumen-tarjetas">
              <article className="tarjeta-resumen">
                <div className="resumen-icono azul">♙</div>
                <div>
                  <span>Aprendices registrados</span>
                  <strong>{aprendices.length}</strong>
                </div>
              </article>

              <article className="tarjeta-resumen">
                <div className="resumen-icono verde">▤</div>
                <div>
                  <span>Gestión académica</span>
                  <strong>Activa</strong>
                </div>
              </article>

              <article className="tarjeta-resumen">
                <div className="resumen-icono naranja">☷</div>
                <div>
                  <span>Usuario conectado</span>
                  <strong>Administrador</strong>
                </div>
              </article>
            </section>

            <section className="tarjeta-dashboard" id="aprendices">
              <div className="titulo-tarjeta">
                <div>
                  <span className="texto-pequeno">USUARIOS DEL SISTEMA</span>
                  <h3>Listado de aprendices</h3>
                  <p>Consulta la información de los aprendices registrados.</p>
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
            </section>

            <section className="tarjeta-dashboard" id="actividades">
              <Actividades token={token} />
            </section>

            <section className="tarjeta-dashboard" id="entregas">
              <EntregasAdmin token={token} />
            </section>

            {mensaje && <div className="mensaje-actividad">{mensaje}</div>}
          </main>

          <footer className="pie-dashboard">
            SENA © 2026 | Formación para el trabajo
          </footer>
        </div>
      </div>
    );
  }

  // PANEL DEL APRENDIZ
  if (sesion && sesion.rol === 'aprendiz') {
    return (
      <div className="aplicacion">
        {menuLateral(false)}

        <div className="contenido-principal">
          {encabezado('Panel del aprendiz')}

          <main className="contenido-dashboard">
            <section className="banner-bienvenida" id="inicio">
              <div>
                <span className="texto-pequeno">MI ESPACIO ACADÉMICO</span>
                <h2>¡Hola, {nombreCompleto}! 👋</h2>
                <p>
                  Bienvenido a tu espacio de aprendizaje. Consulta tus actividades
                  y revisa el estado de tus entregas.
                </p>
              </div>

              <div className="banner-icono">🎓</div>
            </section>

            <section className="tarjeta-dashboard perfil-aprendiz" id="perfil">
              <div className="titulo-tarjeta">
                <div>
                  <span className="texto-pequeno">INFORMACIÓN PERSONAL</span>
                  <h3>Mi perfil</h3>
                  <p>Datos de tu cuenta en el sistema académico.</p>
                </div>
                <div className="avatar-perfil-grande">{inicial}</div>
              </div>

              <div className="informacion-perfil">
                <div className="dato-perfil">
                  <span>Nombre completo</span>
                  <strong>{nombreCompleto}</strong>
                </div>

                <div className="dato-perfil">
                  <span>Número de identificación</span>
                  <strong>{sesion.id}</strong>
                </div>

                <div className="dato-perfil">
                  <span>Usuario</span>
                  <strong>{sesion.usuario}</strong>
                </div>

                <div className="dato-perfil">
                  <span>Correo electrónico</span>
                  <strong>{sesion.correo || 'No registrado'}</strong>
                </div>

                <div className="dato-perfil">
                  <span>Teléfono</span>
                  <strong>{sesion.telefono || 'No registrado'}</strong>
                </div>

                <div className="dato-perfil">
                  <span>Programa de formación</span>
                  <strong>No registrado</strong>
                </div>

                <div className="dato-perfil">
                  <span>Rol</span>
                  <strong>Aprendiz</strong>
                </div>
              </div>
            </section>

            <section className="tarjeta-dashboard" id="actividades">
              <ActividadesAprendiz token={token} />
            </section>

            <div id="entregas"></div>

            {mensaje && <div className="mensaje-actividad">{mensaje}</div>}
          </main>

          <footer className="pie-dashboard">
            SENA © 2026 | Formación para el trabajo
          </footer>
        </div>
      </div>
    );
  }

  // REGISTRO E INICIO DE SESIÓN
  return (
    <div className="pantalla-autenticacion">
      <div className="presentacion-login">
        <div className="logo-login">S</div>
        <h1>Gestión Académica</h1>
        <p>
          Un espacio para administrar actividades, entregas y aprendizaje.
        </p>
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
          <h2>
            {modo === 'registro' ? 'Crear una cuenta' : '¡Qué bueno tenerte de vuelta!'}
          </h2>

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
        SENA © 2026 | Formación para el trabajo
      </footer>
    </div>
  );
}

export default App;
