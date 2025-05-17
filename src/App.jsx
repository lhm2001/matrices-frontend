import React, { useState } from 'react';

const App = () => {
  
  const [matrixInput, setMatrixInput] = useState('');
  const [Q, setQ] = useState([]);
  const [R, setR] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    const response = await fetch(`${import.meta.env.VITE_APP_MATRIX_URL}/token`);
    if (!response.ok) throw new Error('Error al obtener token');
    const data = await response.json();
    return `Bearer ${data.access_token}`;
  };

  const fetchQR = async (matrix, token) => {
    const response = await fetch(`${import.meta.env.VITE_APP_MATRIX_URL}/matrix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ matrix }),
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Error al calcular Q y R');
    return await response.json();
  };

  const fetchStats = async (Q, R, token) => {
    const response = await fetch(`${import.meta.env.VITE_APP_PROCESS_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ Q, R }),
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Error al calcular estadísticas');
    return await response.json();
  };

  const handleProcess = async () => {
    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      const parsedMatrix = JSON.parse(matrixInput);

      const { Q, R } = await fetchQR(parsedMatrix, token);
      setQ(Q);
      setR(R);

      const stats = await fetchStats(Q, R, token);
      setStats(stats);
    } catch (err) {
      console.error(err);
      setError('Error al procesar la matriz. Asegúrate de ingresar una matriz válida.');
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Procesar Matriz</h1>
      <textarea
        rows="6"
        cols="50"
        placeholder='Ej: [[1,2],[3,4]]'
        value={matrixInput}
        onChange={(e) => setMatrixInput(e.target.value)}
      />

      <br />
      <button onClick={handleProcess} disabled={loading}>
        {loading ? 'Procesando...' : 'Enviar'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {Q.length > 0 && (
        <>
          <h2>Matriz Q</h2>
          <pre>{JSON.stringify(Q, null, 2)}</pre>
          <h2>Matriz R</h2>
          <pre>{JSON.stringify(R, null, 2)}</pre>
        </>
      )}

      {stats && (
        <>
          <h2>Estadísticas</h2>
          <ul>
            <li><strong>Máximo:</strong> {stats.max}</li>
            <li><strong>Mínimo:</strong> {stats.min}</li>
            <li><strong>Promedio:</strong> {stats.avg.toFixed(4)}</li>
            <li><strong>Suma:</strong> {stats.sum}</li>
            <li><strong>¿Alguna matriz es diagonal?:</strong> {stats.isDiagonal ? 'Sí' : 'No'}</li>
          </ul>
        </>
      )}
    </div>
  );
};

export default App;