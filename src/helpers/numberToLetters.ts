/**
 * Convierte números a letras (Formato para moneda de Venezuela)
 */
export const numberToLetters = (number: number): string => {
  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const decenas = ["DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const especiales = ["ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
  const centenas = ["", "CIEN", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETENCIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

  const getUnidades = (n: number) => unidades[n];
  const getDecenas = (n: number) => {
    if (n < 10) return getUnidades(n);
    if (n >= 11 && n <= 19) return especiales[n - 11];
    const d = Math.floor(n / 10);
    const u = n % 10;
    if (u === 0) return decenas[d - 1];
    if (d === 1) return "DIECI" + getUnidades(u);
    if (d === 2) return "VEINTI" + getUnidades(u);
    return decenas[d - 1] + " Y " + getUnidades(u);
  };

  const getCentenas = (n: number) => {
    if (n === 100) return "CIEN";
    if (n < 100) return getDecenas(n);
    const c = Math.floor(n / 100);
    const rest = n % 100;
    if (rest === 0) return centenas[c];
    if (c === 1) return "CIENTO " + getDecenas(rest);
    return centenas[c] + " " + getDecenas(rest);
  };

  const getMiles = (n: number) => {
    if (n === 1000) return "MIL";
    if (n < 1000) return getCentenas(n);
    const m = Math.floor(n / 1000);
    const rest = n % 1000;
    let text = "";
    if (m === 1) text = "MIL";
    else text = getCentenas(m) + " MIL";
    if (rest > 0) text += " " + getCentenas(rest);
    return text;
  };

  const getMillones = (n: number) => {
    if (n < 1000000) return getMiles(n);
    const mill = Math.floor(n / 1000000);
    const rest = n % 1000000;
    let text = "";
    if (mill === 1) text = "UN MILLÓN";
    else text = getCentenas(mill) + " MILLONES";
    if (rest > 0) text += " " + getMiles(rest);
    return text;
  };

  const entero = Math.floor(number);
  const decimales = Math.round((number - entero) * 100);

  let resultado = getMillones(entero);
  if (resultado === "") resultado = "CERO";

  const centimos = decimales === 0 ? "SIN CÉNTIMOS" : `CON ${getDecenas(decimales)} CÉNTIMOS`;
  
  return `${resultado} BOLÍVARES ${centimos}`;
};
