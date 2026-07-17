const CITY_IMAGES: Record<string, string> = {
  "São Paulo": "/cities/sao-paulo.png",
  "Rio de Janeiro": "/cities/rio-de-janeiro.png",
  Curitiba: "/cities/curitiba.png",
  "Belo Horizonte": "/cities/belo-horizonte.png",
};

const FALLBACK_IMAGE = "/cities/sao-paulo.png";

export function getCityImage(cityName: string): string {
  return CITY_IMAGES[cityName] ?? FALLBACK_IMAGE;
}
