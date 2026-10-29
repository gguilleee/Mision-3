import { infoTipo } from '../data/tipos.js';
import { nombreBonito, formatearNumero } from '../lib/formato.js';
import InsigniaTipo from './InsigniaTipo.jsx';
import BarraStat from './BarraStat.jsx';
import Ilustracion from './Ilustracion.jsx';

/** Ficha de un Pokémon. Recibe si está en el equipo y avisa al padre con onAlternarEquipo. */
export default function TarjetaPokemon({ pokemon, enEquipo, equipoLleno, onAlternarEquipo }) {
  const { id, nombre, imagen, tipos, stats, total, alturaM, pesoKg } = pokemon;
  const bloqueado = equipoLleno && !enEquipo;

  return (
    <article className="tarjeta" style={{ '--color-tipo': infoTipo(tipos[0]).color }}>
      <div className="tarjeta__cabecera">
        <span>{formatearNumero(id)}</span>
        <span title="Suma de estadísticas base">Σ {total}</span>
      </div>
      <Ilustracion src={imagen} nombre={nombre} />
      <h3 className="tarjeta__nombre">{nombreBonito(nombre)}</h3>
      <div className="tarjeta__tipos">
        {tipos.map((t) => (
          <InsigniaTipo key={t} tipo={t} />
        ))}
      </div>
      <p className="tarjeta__medidas">
        {alturaM} m · {pesoKg} kg
      </p>
      <div className="tarjeta__stats">
        {Object.entries(stats).map(([clave, valor]) => (
          <BarraStat key={clave} clave={clave} valor={valor} />
        ))}
      </div>
      <button
        type="button"
        className={`boton-equipo${enEquipo ? ' boton-equipo--dentro' : ''}`}
        aria-pressed={enEquipo}
        disabled={bloqueado}
        title={bloqueado ? 'El equipo ya tiene 6 Pokémon' : undefined}
        onClick={() => onAlternarEquipo(pokemon)}
      >
        {enEquipo ? '✓ En el equipo' : '+ Al equipo'}
      </button>
    </article>
  );
}
