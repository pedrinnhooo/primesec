import type { NewsTag, NewsTopic } from '#shared/types/news'

interface TopicRule {
  topic: NewsTopic
  patterns: RegExp[]
}

interface TagRule {
  tag: NewsTag
  patterns: RegExp[]
}

const TOPIC_RULES: TopicRule[] = [
  {
    topic: 'lgpd-grc',
    patterns: [
      /\blgpd\b/i,
      /\bgdpr\b/i,
      /\bgrc\b/i,
      /\banpd\b/i,
      /\bprote[cç][aã]o de dados\b/i,
      /\bgovernan[cç]a de (risco|ti|seguran[cç]a)\b/i,
      /\bcompliance\b/i
    ]
  },
  {
    topic: 'ia',
    patterns: [
      /\bintelig[eê]ncia artificial\b/i,
      /\bIA\b/,
      /\bIAs\b/,
      /\bmachine learning\b/i,
      /\baprendizado de m[aá]quina\b/i,
      /\bllm\b/i,
      /\bChatGPT\b/i,
      /\bopenai\b/i,
      /\bdeep learning\b/i,
      /\bmodelo(s)? de ia\b/i,
      /\bgenai\b/i,
      /\bgenerative ai\b/i
    ]
  },
  {
    topic: 'purpleteam',
    patterns: [
      /\bpurple\s*team\b/i,
      /\btime\s*roxo\b/i,
      /\bequipe\s*roxa\b/i,
      /\bred\s*(e|&|and)\s*blue\s*team\b/i,
      /\bataque e defesa\b/i,
      /\bsimula[cç][aã]o advers[aá]ria\b/i
    ]
  },
  {
    topic: 'redteam',
    patterns: [
      /\bred\s*team\b/i,
      /\bpentest\b/i,
      /\bpenetration\s*test\b/i,
      /\bteste de invas[aã]o\b/i,
      /\boffensive\s*(security|sec)?\b/i,
      /\bexploit(ation|ar|a[cç][aã]o)?\b/i,
      /\bprova de conceito\b/i,
      /\bproof[\s-]of[\s-]concept\b/i,
      /\bzero[\s-]?day\b/i,
      /\brce\b/i,
      /\bremote\s*code\s*execution\b/i,
      /\binvas[aã]o\b/i,
      /\bethical\s*hack(er|ing)?\b/i
    ]
  },
  {
    topic: 'blueteam',
    patterns: [
      /\bblue\s*team\b/i,
      /\bsoc\b/i,
      /\bsiem\b/i,
      /\bdetec[cç][aã]o\b/i,
      /\bresposta a incidentes?\b/i,
      /\bdefesa\b/i,
      /\bmonitoramento\b/i,
      /\bxdr\b/i,
      /\bedr\b/i,
      /\bfirewall\b/i,
      /\bpatch(es|ing)?\b/i,
      /\bcorre[cç][aã]o\b/i,
      /\bransomware\b/i,
      /\bmalware\b/i,
      /\bcves?\b/i,
      /\bvulnerabilidade(s)?\b/i,
      /\bataque\s*(cibern[eé]tico|de\s*ransomware|de\s*phishing)\b/i,
      /\bhacker(s)?\b/i
    ]
  },
  {
    topic: 'uiux',
    patterns: [
      /\bui\s*\/\s*ux\b/i,
      /\buiux\b/i,
      /\bdesign de interface\b/i,
      /\bexperi[eê]ncia do usu[aá]rio\b/i,
      /\bfigma\b/i,
      /\busabilidade\b/i,
      /\bdesign system\b/i,
      /\bproduct design\b/i
    ]
  },
  {
    // Antes de frontend/backend: React Native, Kotlin Android, etc.
    topic: 'mobile',
    patterns: [
      /\bflutter\b/i,
      /\bdart\s*(lang|language|sdk)?\b/i,
      /\breact\s*native\b/i,
      /\bexpo\s*(sdk|router|go)?\b/i,
      /\bios\s*(app|sdk|dev|development|developer)?\b/i,
      /\biphone\b/i,
      /\bipad(os)?\b/i,
      /\bswift(ui)?\b/i,
      /\bxcode\b/i,
      /\bandroid\b/i,
      /\bjetpack\s*compose\b/i,
      /\bkotlin\s*multiplatform\b/i,
      /\bkmp\b/i,
      /\bmobile\s*(app|apps|dev|development|developer)\b/i,
      /\bapp\s*nativ[oa]\b/i,
      /\bcross[\s-]?platform\s*(app|mobile|framework)\b/i,
      /\bdesenvolvimento\s*mobile\b/i,
      /\bdesarrollo\s*m[oó]vil\b/i
    ]
  },
  {
    topic: 'frontend',
    patterns: [
      /\bfront[\s-]?end\b/i,
      /\bfrontend\b/i,
      /\breact(?!\s*native)\b/i,
      /\bnext\.?js\b/i,
      /\bvue\.?js\b/i,
      /\bnuxt\b/i,
      /\bangular\b/i,
      /\bsvelte(kit)?\b/i,
      /\btailwind\b/i,
      /\bcss\b/i,
      /\bhtml5?\b/i,
      /\btypescript\b/i,
      /\bjavascript\b/i,
      /\bweb\s*component(s)?\b/i,
      /\bspa\b/i,
      /\bpwa\b/i
    ]
  },
  {
    topic: 'backend',
    patterns: [
      /\bback[\s-]?end\b/i,
      /\bbackend\b/i,
      /\bnode\.?js\b/i,
      /\bexpress\.?js\b/i,
      /\bnest\.?js\b/i,
      /\bdjango\b/i,
      /\bflask\b/i,
      /\bfastapi\b/i,
      /\bspring\s*boot\b/i,
      /\bapi\s*rest\b/i,
      /\bgraphql\b/i,
      /\bmicroservi[cç]o(s)?\b/i,
      /\bserver[\s-]?side\b/i,
      /\bgolang\b/i,
      /\brust\b/i,
      /\bkotlin\b/i,
      /\bdotnet\b/i,
      /\b\.net\b/i,
      /\blaravel\b/i,
      /\brails\b/i
    ]
  },
  {
    topic: 'database',
    patterns: [
      /\bdatabase(s)?\b/i,
      /\bsql\b/i,
      /\bnosql\b/i,
      /\bpostgres(ql)?\b/i,
      /\bmysql\b/i,
      /\bmariadb\b/i,
      /\bmongodb\b/i,
      /\bredis\b/i,
      /\belasticsearch\b/i,
      /\bdynamodb\b/i,
      /\bcassandra\b/i,
      /\bsqlite\b/i,
      /\boracle\s*db\b/i,
      /\bprisma\b/i,
      /\bdata\s*warehouse\b/i,
      /\betl\b/i,
      /\bbanco(s)?\s+de\s+dados\s+(relacional|sql|nosql|em\s+nuvem)\b/i
    ]
  }
]

/** Ordem: Flutter em destaque, depois RN / iOS / Android. */
const TAG_RULES: TagRule[] = [
  {
    tag: 'flutter',
    patterns: [
      /\bflutter\b/i,
      /\bdart\s*(lang|language|sdk|package|pub\.dev)?\b/i,
      /\bpub\.dev\b/i
    ]
  },
  {
    tag: 'react-native',
    patterns: [
      /\breact\s*native\b/i,
      /\bexpo\s*(sdk|router|go|cli)?\b/i
    ]
  },
  {
    tag: 'ios',
    patterns: [
      /\bios\b/i,
      /\biphone\b/i,
      /\bipad(os)?\b/i,
      /\bswift(ui)?\b/i,
      /\bxcode\b/i,
      /\bapp\s*store\b/i
    ]
  },
  {
    tag: 'android',
    patterns: [
      /\bandroid\b/i,
      /\bjetpack\s*compose\b/i,
      /\bgoogle\s*play\b/i,
      /\bplay\s*store\b/i,
      /\bkotlin\s*multiplatform\b/i
    ]
  }
]

/** Infere subtema a partir de título, descrição e categorias do feed. */
export function inferNewsTopic(
  text: string,
  preferred?: NewsTopic | null
): NewsTopic | undefined {
  if (preferred) return preferred

  for (const rule of TOPIC_RULES) {
    if (rule.patterns.some(pattern => pattern.test(text))) {
      return rule.topic
    }
  }

  return undefined
}

/** Confere se o texto casa com os padrões de um subtema específico. */
export function matchesTopic(text: string, topic: NewsTopic): boolean {
  if (topic === 'geral') return true
  const rule = TOPIC_RULES.find(entry => entry.topic === topic)
  return rule ? rule.patterns.some(pattern => pattern.test(text)) : false
}

/** Infere etiquetas Mobile (Flutter, React Native, iOS, Android). */
export function inferNewsTags(text: string): NewsTag[] {
  const tags: NewsTag[] = []
  for (const rule of TAG_RULES) {
    if (rule.patterns.some(pattern => pattern.test(text))) {
      tags.push(rule.tag)
    }
  }
  return tags
}

export function matchesTag(text: string, tag: NewsTag): boolean {
  const rule = TAG_RULES.find(entry => entry.tag === tag)
  return rule ? rule.patterns.some(pattern => pattern.test(text)) : false
}
