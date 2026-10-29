import { useState } from 'react';

/** Imagen del Pokémon con marcador "?" si no hay URL o si la imagen no carga. */
export default function Ilustracion({ src, nombre, tamano = 160 }) {
  const [rota, setRota] = useState(false);

  if (!src || rota) {
    return (
      <div className="tarjeta__imagen tarjeta__imagen--vacia" style={{ width: tamano, height: tamano }} aria-hidden="true">
        ?
      </div>
    );
  }
  return (
    <img
      className="tarjeta__imagen"
      src={src}
      alt={`Ilustración de ${nombre}`}
      loading="lazy"
      width={tamano}
      height={tamano}
      onError={() => setRota(true)}
    />
  );
}
