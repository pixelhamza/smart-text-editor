const commonWords = [
  "accommodate","achieve","acquire","address","argument","beautiful","because","beginning","believe","business",
  "calendar","category","commitment","committee","completely","conscience","conscious","definitely","dependent","disappear",
  "disappoint","embarrass","environment","existence","experience","familiar","finally","foreign","forty","friend",
  "grammar","grateful","guarantee","harass","height","humorous","immediately","independent","intelligence","interrupt",
  "knowledge","leisure","library","lightning","maintenance","marriage","minute","necessary","neighbour","noticeable",
  "occasion","occurrence","official","parallel","parliament","particular","perform","personnel","possession","possible",
  "preferred","principal","privilege","probably","professional","publicly","really","receive","recommend","referred",
  "relevant","religious","remember","resistance","restaurant","rhythm","schedule","separate","sergeant","similar",
  "successful","supersede","surprise","tomorrow","tremendous","truly","unfortunately","until","vacuum","village",
  "weather","weird","whether","writing","yacht","yourself","across","against","although","among","algorithm","hello","love","information"
];

export function getCorrection(word) {
  if (!word) return word;
  word = word.toLowerCase();
  if (commonWords.includes(word)) return word;


  let best = word;
  let bestDist = 3;

  for (const w of commonWords) {
    const d = levenshtein(word, w);
    if (d < bestDist) {
      best = w;
      bestDist = d;
    }
  }
  return bestDist <= 2 ? best : word;
}

function levenshtein(a, b) {
  const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}