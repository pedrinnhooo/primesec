/**
 * Qualidade do feed: blocklist (lixo óbvio) + allowlist (precisa parecer tech/ciber).
 * Feeds gerais (Olhar Digital, Tecnoblog, CryptoID…) passam pelos dois.
 */

const OFF_TOPIC_PATTERNS: RegExp[] = [
  // Loterias / jogos de azar
  /\blotof[aá]cil\b/i,
  /\bmega[\s-]?sena\b/i,
  /\bquina\b/i,
  /\bduplo\s*sena\b/i,
  /\bloteria(s)?\b/i,
  /\bresultado(s)?\s+da\s+(lotof|mega|quina|dupla|timemania|dia\s*de\s*sorte)/i,
  /\bconcurso\s+\d{3,}\b/i,
  /\bganhador(es)?\s+do\s+concurso\b/i,
  /\btimemania\b/i,
  /\bdia\s*de\s*sorte\b/i,
  /\bsorteio\b/i,
  // Esportes / fitness
  /\bresultado(s)?\s+do\s+(jogo|placar|brasileir[aã]o)\b/i,
  /\bplacar\s+(ao\s+vivo|final)\b/i,
  /\bfutebol\b/i,
  /\bcopa\s+do\s+mundo\b/i,
  /\batleta(s)?\b/i,
  /\bmaratona\b/i,
  /\bcorrida(s)?\s+(de\s+rua|noturna|infantil)?\b/i,
  /\bcampeonato\b/i,
  /\bolimp[ií]ad[ao]s?\b/i,
  // Celebridades / fofoca / reality / novela
  /\bbb\s*b?\s*2[0-9]\b/i,
  /\bbb\s*brasil\b/i,
  /\bnovela\b/i,
  /\bcelebridade(s)?\b/i,
  /\bfamos[oa]s?\b/i,
  // Horóscopo / lifestyle
  /\bhor[oó]scopo\b/i,
  /\bsigno(s)?\s+do\s+zod[ií]aco\b/i,
  // Clima / desastres naturais
  /\btornado\b/i,
  /\bmeteorologista(s)?\b/i,
  /\bprevis[aã]o\s+do\s+tempo\b/i,
  /\bterremoto\b/i,
  /\bfurac[aã]o\b/i,
  /\benchente(s)?\b/i,
  // Varejo / promoções de consumo (não é notícia tech)
  /\bdia dos pais\b/i,
  /\bdia das m[aã]es\b/i,
  /\bblack\s*friday\b/i,
  /\bem promo[cç][aã]o\b/i,
  /\bmenor pre[cç]o\b/i,
  /\bdesconto\s+(imbat[ií]vel|de\s+\d+)\b/i,
  /\bqueda repentina de \d+%\b/i,
  // Games / entretenimento puro
  /\bspider[\s-]?man\b/i,
  /\bplaystation\b/i,
  /\bps[345]\b/i,
  /\bxbox(\s*game\s*pass)?\b/i,
  /\bnintendo\b/i,
  /\bgame\s*pass\b/i,
  /\bhbo\s*max\b/i,
  /\bnetflix\b/i,
  /\bdisney\+?\b/i,
  /\bprime\s*video\b/i,
  /\bapple\s*tv\+?\b/i,
  /\btrailer\b/i,
  /\btemporada\s+\d+\b/i,
  // Delivery / food / lifestyle apps sem ângulo tech
  /\b99compras\b/i,
  /\bifood\b/i,
  /\bdesperd[ií]cio de alimentos\b/i,
  // Finanças / tributos / crime sem ângulo cyber
  /\breforma tribut[aá]ria\b/i,
  /\bincerteza tribut[aá]ria\b/i,
  /\bpagamentos?\s+cross[\s-]?border\b/i,
  /\bcrime\s+organizado\b/i,
  /\bestuprador(es|as)?\b/i,
  /\bvereador(a|es)?\b/i
]

/** Sinais de tecnologia / produto digital. */
const TECH_RELEVANCE_PATTERNS: RegExp[] = [
  /\btecnolog/i,
  /\bdigital\b/i,
  /\bsoftware\b/i,
  /\bhardware\b/i,
  /\baplicativo(s)?\b/i,
  /\bapp(s)?\b/i,
  /\bsmartphone(s)?\b/i,
  /\bcelular(es)?\b/i,
  /\bcomputador(es)?\b/i,
  /\bnotebook(s)?\b/i,
  /\bchip(s)?\b/i,
  /\bsemicondutor(es)?\b/i,
  /\bprocessador(es)?\b/i,
  /\bintel\b/i,
  /\bamd\b/i,
  /\bnvidia\b/i,
  /\bqualcomm\b/i,
  /\bsamsung\b/i,
  /\bapple\b/i,
  /\bgoogle\b/i,
  /\bmicrosoft\b/i,
  /\bmeta\b/i,
  /\bamazon\b/i,
  /\bopenai\b/i,
  /\banthropic\b/i,
  /\bintel(ig[eê]ncia)?\s*artificial\b/i,
  /\bIA\b/,
  /\bIAs\b/,
  /\bmachine learning\b/i,
  /\bllm\b/i,
  /\bchatgpt\b/i,
  /\bclaude\b/i,
  /\bgemini\b/i,
  /\brob[oô](s|tica)?\b/i,
  /\b5g\b/i,
  /\b4g\b/i,
  /\b2g\b/i,
  /\brede(s)?\s*(m[oó]vel|wifi|wi[\s-]?fi)\b/i,
  /\binternet\b/i,
  /\bnuvem\b/i,
  /\bcloud\b/i,
  /\bsaas\b/i,
  /\bapi(s)?\b/i,
  /\bprograma[cç]/i,
  /\bc[oó]digo\b/i,
  /\bdeveloper(s)?\b/i,
  /\bdesenvolvedor/i,
  /\btypescript\b/i,
  /\bjavascript\b/i,
  /\bpython\b/i,
  /\breact\b/i,
  /\bnode\.?js\b/i,
  /\bgit(hub)?\b/i,
  /\bdevops\b/i,
  /\bui\s*\/?\s*ux\b/i,
  /\bfigma\b/i,
  /\bdesign\b/i,
  /\bstartup(s)?\b/i,
  /\binova[cç]/i,
  /\bgadget(s)?\b/i,
  /\bwearable(s)?\b/i,
  /\bdrone(s)?\b/i,
  /\bsatel[ií]te(s)?\b/i,
  /\beletr[oô]nico(s)?\b/i,
  /\bplataforma\b/i,
  /\balgoritmo(s)?\b/i,
  /\bdados\b/i,
  /\bbanco(s)? de dados\b/i,
  /\bservidor(es)?\b/i,
  /\bwindows\b/i,
  /\bandroid\b/i,
  /\bios\b/i,
  /\bmacos\b/i,
  /\blinux\b/i,
  /\byoutube\b/i,
  /\bwhatsapp\b/i,
  /\btelegram\b/i,
  /\bpixel\b/i,
  /\bgalaxy\b/i,
  /\blenovo\b/i,
  /\bxiaomi\b/i,
  /\bhuawei\b/i,
  /\btim\b/i,
  /\bclaro\b/i,
  /\bvivo\b/i,
  /\boi\b/i
]

/** Sinais de cibersegurança / identidade digital / privacidade. */
const CYBER_RELEVANCE_PATTERNS: RegExp[] = [
  /\bciberseguran/i,
  /\bcyber\s*security\b/i,
  /\bcybersecurity\b/i,
  /\bseguran[cç]a\s+(da\s+informa[cç][aã]o|cibern|digital|da\s+rede)/i,
  /\bseguran[cç]a\b/i,
  /\bphishing\b/i,
  /\bransomware\b/i,
  /\bmalware\b/i,
  /\bspyware\b/i,
  /\bbotnet\b/i,
  /\bhacker(s|eamento)?\b/i,
  /\bhacking\b/i,
  /\bexploit\b/i,
  /\bvulnerabilidade(s)?\b/i,
  /\bcves?\b/i,
  /\brce\b/i,
  /\bzero[\s-]?day\b/i,
  /\bpentest\b/i,
  /\bred\s*team\b/i,
  /\bblue\s*team\b/i,
  /\bpurple\s*team\b/i,
  /\bsoc\b/i,
  /\bsiem\b/i,
  /\bxdr\b/i,
  /\bedr\b/i,
  /\bfirewall\b/i,
  /\bpatch(es|ing)?\b/i,
  /\bataque(s)?\b/i,
  /\bamea[cç]a(s)?\b/i,
  /\bfraude(s)?\b/i,
  /\bgolpe(s)?\b/i,
  /\bvazamento(s)?\b/i,
  /\bbrecha(s)?\b/i,
  /\binvas[aã]o\b/i,
  /\bincidente(s)?\b/i,
  /\bprivacidade\b/i,
  /\blgpd\b/i,
  /\bgdpr\b/i,
  /\banpd\b/i,
  /\bprote[cç][aã]o de dados\b/i,
  /\bcompliance\b/i,
  /\bgrc\b/i,
  /\bautentica[cç]/i,
  /\bmfa\b/i,
  /\b2fa\b/i,
  /\bcriptograf/i,
  /\bcert\.?br\b/i,
  /\bcsirt\b/i,
  /\bmisp\b/i,
  /\bcisa\b/i,
  /\bidentity\b/i,
  /\bidentidade\s+digital\b/i,
  /\bbiometria\b/i,
  /\brfid\b/i,
  /\bworm\b/i,
  /\btrojan\b/i,
  /\brootkit\b/i,
  /\bddos\b/i,
  /\bwaf\b/i,
  /\bzero\s*trust\b/i
]

export type RelevanceMode = 'tech' | 'cyber'

/** Lixo explícito (loteria, clima, promo, games…). */
export function isOffTopicNews(text: string): boolean {
  return OFF_TOPIC_PATTERNS.some(pattern => pattern.test(text))
}

export function matchesTechRelevance(text: string): boolean {
  return TECH_RELEVANCE_PATTERNS.some(pattern => pattern.test(text))
}

export function matchesCyberRelevance(text: string): boolean {
  return CYBER_RELEVANCE_PATTERNS.some(pattern => pattern.test(text))
}

/** True se o texto tem sinal mínimo do escopo pedido. */
export function isRelevantNews(text: string, mode: RelevanceMode): boolean {
  if (mode === 'cyber') return matchesCyberRelevance(text)
  return matchesTechRelevance(text) || matchesCyberRelevance(text)
}

/**
 * Decisão final de inclusão.
 * - Sempre descarta off-topic.
 * - Se `requireRelevance` estiver setado, exige allowlist do modo.
 */
export function shouldKeepNews(
  text: string,
  requireRelevance?: RelevanceMode | null
): boolean {
  if (isOffTopicNews(text)) return false
  if (requireRelevance && !isRelevantNews(text, requireRelevance)) return false
  return true
}

/** Sinais fortes o bastante para forçar categoria Cibersegurança (não usa "segurança"/"ataque" sozinhos). */
const CYBER_CATEGORY_PATTERNS: RegExp[] = [
  /\bciberseguran/i,
  /\bcyber\s*security\b/i,
  /\bcybersecurity\b/i,
  /\bseguran[cç]a\s+(da\s+informa[cç][aã]o|cibern[eé]tica|digital)\b/i,
  /\bphishing\b/i,
  /\bransomware\b/i,
  /\bmalware\b/i,
  /\bspyware\b/i,
  /\bbotnet\b/i,
  /\bhacker(s|eamento)?\b/i,
  /\bhacking\b/i,
  /\bexploit\b/i,
  /\bvulnerabilidade(s)?\b/i,
  /\bcves?\b/i,
  /\brce\b/i,
  /\bzero[\s-]?day\b/i,
  /\bpentest\b/i,
  /\bred\s*team\b/i,
  /\bblue\s*team\b/i,
  /\bpurple\s*team\b/i,
  /\bsiem\b/i,
  /\bxdr\b/i,
  /\bedr\b/i,
  /\bataque(s)?\s+cibern/i,
  /\binvas[aã]o\b/i,
  /\binvadiu\b/i,
  /\bvazamento(s)?\s+de\s+dados\b/i,
  /\blgpd\b/i,
  /\bgdpr\b/i,
  /\banpd\b/i,
  /\bprote[cç][aã]o de dados\b/i,
  /\bcibercrime\b/i,
  /\bcert\.?br\b/i,
  /\bcsirt\b/i,
  /\bcisa\b/i,
  /\bddos\b/i
]

/** Sinais fortes o bastante para forçar categoria Cibersegurança. */
export function looksLikeCyberNews(text: string): boolean {
  return CYBER_CATEGORY_PATTERNS.some(pattern => pattern.test(text))
}
