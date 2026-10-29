import { infoTipo } from '../data/tipos.js';
import InsigniaTipo from './InsigniaTipo.jsx';

function Relacion({ etiqueta, tipos }) {
  return (
    <div className="relacion">
      <dt>{etiqueta}</dt>
      <dd>
        {tipos.length > 0 ? tipos.map((t) => <InsigniaTipo key={t} tipo={t} />) : <span className="nada">ninguno</span>}
      </dd>
    </div>
  );
}

/** Cabecera de la expedición: relaciones de daño del tipo. */
export default function FichaTipo({ tipo }) {
  const { es, color } = infoTipo(tipo.nombre);
  return (
    <div className="ficha" style={{ '--color-tipo': color }}>
      <h3 className="ficha__titulo">Destino: tipo {es}</h3>
      <p className="ficha__subtitulo">{tipo.pokemon.length} especies avistadas en este territorio</p>
      <dl className="ficha__relaciones">
        <Relacion etiqueta="Fuerte contra" tipos={tipo.fuerteContra} />
        <Relacion etiqueta="Débil ante" tipos={tipo.debilContra} />
        <Relacion etiqueta="Inmune a" tipos={tipo.inmuneA} />
      </dl>
    </div>
  );
}
