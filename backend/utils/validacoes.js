export const isPositiveNumber = (valor) => {
  const num = Number(valor);
  return !isNaN(num) && num > 0;
};

export const isValidId = (id) => {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
};