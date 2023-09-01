const elem = (cssSelektor) => document.querySelector(cssSelektor);
const elemGroup = (cssSelektor) => document.querySelectorAll(cssSelektor);
const clamp = (value, min, max) =>
{
  if (value > max) value = max;
  else if (value < min) value = min;
  return value;
}