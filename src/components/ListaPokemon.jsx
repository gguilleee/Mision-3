import TarjetaPokemon from './TarjetaPokemon.jsx';

/** Rejilla de tarjetas. La key es el id de Pokédex: estable aunque se reordene la lista. */
export default function ListaPokemon({ lista, idsEquipo, equipoLleno, onAlternarEquipo }) {
  return (
    <div className="rejilla">
      {lista.map((pokemon) => (
        <TarjetaPokemon
          key={pokemon.id}
          pokemon={pokemon}
          enEquipo={idsEquipo.has(pokemon.id)}
          equipoLleno={equipoLleno}
          onAlternarEquipo={onAlternarEquipo}
        />
      ))}
    </div>
  );
}
