
import { useState } from 'react';
import './App.css';

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

      // Guardar sesión y token
      if (!resultado.token || !resultado.usuario) {
        setMensaje('El servidor no devolvió los datos de sesión');
        return;
      }

      setToken(resultado.token);
      setSesion(resultado.usuario);
      localStorage.setItem('token', resultado.token);

      // Consultar aprendices si es administrador
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

  // Panel del administrador
  if (sesion && sesion.rol === 'admin') {
    return (
      <div className="contenedor">
        <h2>Panel de administrador</h2>

        <h3>Listado de aprendices</h3>

        {cargando ? (
          <p>Cargando aprendices...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '20px'
            }}>
              <thead>
                <tr>
                  {['ID', 'Nombre', 'Apellidos', 'Correo', 'Teléfono', 'Usuario', 'Rol'].map((titulo) => (
                    <th key={titulo} style={{
                      border: '1px solid #ccc',
                      padding: '10px',
                      background: '#1a5da8',
                      color: 'white'
                    }}>
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {aprendices.map((persona) => (
                  <tr key={persona.id}>
                    {[
                      persona.id,
                      persona.nombre,
                      persona.apellidos,
                      persona.correo,
                      persona.telefono,
                      persona.usuario,
                      persona.rol
                    ].map((dato, indice) => (
                      <td key={indice} style={{
                        border: '1px solid #ccc',
                        padding: '10px'
                      }}>
                        {dato}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {aprendices.length === 0 && (
              <p>No hay aprendices registrados.</p>
            )}
          </div>
        )}

        {mensaje && <p>{mensaje}</p>}

        <button type="button" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  // Panel del aprendiz
  if (sesion && sesion.rol === 'aprendiz') {
    return (
      <div className="contenedor">
        <h2>Panel de control</h2>

        <h3>Bienvenido, {sesion.usuario}</h3>

        <p>Has iniciado sesión correctamente.</p>

        <p><strong>ID:</strong> {sesion.id}</p>
        <p><strong>Usuario:</strong> {sesion.usuario}</p>
        <p><strong>Rol:</strong> {sesion.rol}</p>

        <button type="button" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="contenedor">
      <div className="botones">
        <button type="button" onClick={() => {
          setModo('registro');
          setMensaje('');
        }}>
          Crear cuenta
        </button>

        <button type="button" onClick={() => {
          setModo('login');
          setMensaje('');
        }}>
          Iniciar sesión
        </button>
      </div>

      <form onSubmit={manejarEnvio}>
        <h2>{modo === 'registro' ? 'Crear cuenta' : 'Iniciar sesión'}</h2>

        {modo === 'registro' && (
          <>
            <input
              type="text"
              placeholder="Nombres"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Apellidos"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
            />

            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            <input
              type="tel"
              placeholder="Número de celular"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </>
        )}

        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {modo === 'registro' && (
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            required
          />
        )}

        <button type="submit">
          {modo === 'registro' ? 'Registrarse' : 'Ingresar'}
        </button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default App;
