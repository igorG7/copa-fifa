export interface TeamPreset {
  nome: string;
  escudoUrl: string;
}

// Escudos servidos por CDNs públicos e estáveis:
// - clubes europeus: crests.football-data.org (imagem aberta, sem necessidade de chave)
// - clubes brasileiros: Wikimedia Commons via Special:FilePath (redireciona pro arquivo real)
export const TEAM_PRESETS: TeamPreset[] = [
  { nome: "Real Madrid", escudoUrl: "https://crests.football-data.org/86.png" },
  { nome: "FC Barcelona", escudoUrl: "https://crests.football-data.org/81.png" },
  { nome: "Atlético de Madrid", escudoUrl: "https://crests.football-data.org/78.png" },
  { nome: "Manchester United", escudoUrl: "https://crests.football-data.org/66.png" },
  { nome: "Manchester City", escudoUrl: "https://crests.football-data.org/65.png" },
  { nome: "Liverpool", escudoUrl: "https://crests.football-data.org/64.png" },
  { nome: "Chelsea", escudoUrl: "https://crests.football-data.org/61.png" },
  { nome: "Arsenal", escudoUrl: "https://crests.football-data.org/57.png" },
  { nome: "Tottenham Hotspur", escudoUrl: "https://crests.football-data.org/73.png" },
  { nome: "Bayern de Munique", escudoUrl: "https://crests.football-data.org/5.png" },
  { nome: "Borussia Dortmund", escudoUrl: "https://crests.football-data.org/4.png" },
  { nome: "Juventus", escudoUrl: "https://crests.football-data.org/109.png" },
  { nome: "AC Milan", escudoUrl: "https://crests.football-data.org/98.png" },
  { nome: "Inter de Milão", escudoUrl: "https://crests.football-data.org/108.png" },
  { nome: "Paris Saint-Germain", escudoUrl: "https://crests.football-data.org/524.png" },
  {
    nome: "Flamengo",
    escudoUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Clube%20de%20Regatas%20do%20Flamengo%20logo.svg",
  },
  {
    nome: "Palmeiras",
    escudoUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Palmeiras%20logo.svg",
  },
  {
    nome: "São Paulo",
    escudoUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/S%C3%A3o%20Paulo%20Futebol%20Clube%20logo%20(2022).svg",
  },
  {
    nome: "Cruzeiro",
    escudoUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cruzeiro%20Esporte%20Clube%20(logo).svg",
  },
  {
    nome: "Atlético Mineiro",
    escudoUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Clube%20Atl%C3%A9tico%20Mineiro%20logo.svg",
  },
  {
    nome: "Internacional",
    escudoUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Escudo%20do%20Sport%20Club%20Internacional.svg",
  },
];
