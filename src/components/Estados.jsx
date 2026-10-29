// Componentes de estado: cargando, error y vacío. Se reutilizan en toda la app.

export function Cargando({ mensaje = 'Cargando…', esqueletos = 8 }) {
  return (
    <>
      <p className="estado estado--cargando" role="status">
        {mensaje}
      </p>
      {esqueletos > 0 && (
        <div className="rejilla">
          {Array.from({ length: esqueletos }, (_, i) => (
            <div key={i} className="tarjeta tarjeta--esqueleto" aria-hidden="true" />
          ))}
        </div>
      )}
    </>
  );
}

export function MensajeError({ mensaje, onReintentar }) {
  return (
    <div className="estado estado--error" role="alert">
      <p>⚠ {mensaje}</p>
      {onReintentar && (
        <button className="boton" type="button" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Vacio({ mensaje }) {
  return <p className="estado estado--vacio">{mensaje}</p>;
}
