// Pequeños formateadores de texto para la vista (funciones puras).
const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

export const nombreBonito = (nombre) => capitalizar(String(nombre).replaceAll('-', ' '));
export const formatearNumero = (id) => `#${String(id).padStart(4, '0')}`;
