import { infoTipo } from '../data/tipos.js';
import { resumir, companerosDeTipo } from '../lib/transform.js';
import { nombreBonito } from '../lib/formato.js';
import InsigniaTipo from './InsigniaTipo.jsx';

function Dato({ etiqueta, valor }) {
  return (
    <div className="dato">
      <span className="dato__valor">{valor}</span>
      <span className="dato__etiqueta">{etiqueta}</span>
    </div>
  );
}

/** Cifras calculadas a partir de la lista visible. Son valores derivados: no se guardan en estado. */
export default function Resumen({ lista, tipoActual }) {
  const resumen = resumir(lista);
  if (!resumen) return null;

  const companeros = companerosDeTipo(lista, tipoActual);
  const { es } = infoTipo(tipoActual);

  return (
    <div className="resumen">
      <div className="datos">
        <Dato etiqueta="en pantalla" valor={resumen.cantidad} />
        <Dato etiqueta="media de stats" valor={resumen.mediaTotal} />
        <Dato etiqueta="el más fuerte" valor={nombreBonito(resumen.masFuerte.nombre)} />
        <Dato etiqueta="el más rápido" valor={nombreBonito(resumen.masRapido.nombre)} />
        <Dato
          etiqueta="el más pesado"
          valor={`${nombreBonito(resumen.masPesado.nombre)} · ${resumen.masPesado.pesoKg} kg`}
        />
      </div>
      <p className="resumen__titulo">Combinaciones de tipo entre los mostrados</p>
      <ul className="companeros">
        {companeros.map(({ tipo, cantidad }) => (
          <li key={tipo} className="companero">
            {tipo === 'puro' ? <span className="insignia insignia--puro">Solo {es}</span> : <InsigniaTipo tipo={tipo} />}
            <span>× {cantidad}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
