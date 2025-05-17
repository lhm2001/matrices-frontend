import React, { useState } from 'react';

const App = () => {
  const [matrixInput, setMatrixInput] = useState('');
  const [Q, setQ] = useState([]);
  const [R, setR] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState('');


  const handleProcess = async () => {
    setLoading(true);
    setError('');
    try {

      const tokenRes = await fetch('https://rm6ijm34sa.execute-api.us-east-2.amazonaws.com/token');
      if (!tokenRes.ok) throw new Error('Error al obtener token');
      const tokenData = await tokenRes.json();
      const token = `Bearer ${tokenData.access_token}`;

      setAuthToken(token);

      const parsedMatrix = JSON.parse(matrixInput);

      const res1 = await fetch('https://rm6ijm34sa.execute-api.us-east-2.amazonaws.com/matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ matrix: parsedMatrix }),
        credentials: 'include'
      });

      const { Q, R } = await res1.json();
      setQ(Q);
      setR(R);

      const res2 = await fetch('https://z4wy7bpxsf.execute-api.us-east-2.amazonaws.com/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ Q, R }),
        credentials: 'include'
      });

      const data2 = await res2.json();
      setStats(data2);
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
