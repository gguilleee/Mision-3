/** Buscador, selector de orden y botón de caché. Componente controlado: no guarda estado propio. */
export default function Controles({ busqueda, onBuscar, orden, onOrdenar, onVaciarCache }) {
  return (
    <div className="controles">
      <label className="campo">
        Buscar en este tipo
        <input
          id="buscador"
          type="search"
          placeholder="Nombre o número…"
          autoComplete="off"
          value={busqueda}
          onChange={(e) => onBuscar(e.target.value)}
        />
      </label>
      <label className="campo">
        Ordenar los mostrados por
        <select id="orden" value={orden} onChange={(e) => onOrdenar(e.target.value)}>
          <option value="id">Número de Pokédex</option>
          <option value="nombre">Nombre (A-Z)</option>
          <option value="total">Stats totales</option>
          <option value="velocidad">Velocidad</option>
          <option value="peso">Peso</option>
        </select>
      </label>
      <button className="boton boton--secundario" type="button" onClick={onVaciarCache}>
        Vaciar caché
      </button>
    </div>
  );
}
