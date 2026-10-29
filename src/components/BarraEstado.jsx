/** Línea informativa: cuántos se ven, de dónde vinieron y si alguno falló. */
export default function BarraEstado({ mostrados, coincidencias, perdidos, metricas, aviso, onReintentar }) {
  if (aviso) {
    return (
      <p className="barra-estado" aria-live="polite">
        {aviso}
      </p>
    );
  }

  const partes = [`Mostrando ${mostrados} de ${coincidencias}`];
  if (metricas && (metricas.red > 0 || metricas.cache > 0)) {
    partes.push(`${metricas.red} desde la red, ${metricas.cache} desde la caché`);
  }

  return (
    <p className="barra-estado" aria-live="polite">
      <span>{partes.join(' · ')}</span>
      {perdidos > 0 && (
        <>
          <span className="aviso"> · ⚠ {perdidos} no se pudieron cargar, </span>
          <button className="enlace" type="button" onClick={onReintentar}>
            reintentar
          </button>
        </>
      )}
    </p>
  );
}
