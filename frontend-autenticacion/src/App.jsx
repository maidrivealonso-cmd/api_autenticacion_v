
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
      const respuesta = await fetch(`http://localhost:3000/api/${modo}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      const resultado = await respuesta.json();
      setMensaje(resultado.mensaje);

      if (respuesta.ok && modo === 'registro') {
        setNombre('');
        setApellidos('');
        setFechaNacimiento('');
        setCorreo('');
        setTelefono('');
        setUsuario('');
        setPassword('');
        setConfirmarPassword('');
      }

    } catch (error) {
      setMensaje('No se pudo conectar con el servidor');
    }
  };

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
