import type { NewsTopic } from '#shared/types/news'

interface TopicRule {
  topic: NewsTopic
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
      /\boffensive\b/i,
      /\bexploit\b/i,
      /\bransomware\b/i,
      /\bmalware\b/i,
      /\bataque\b/i,
      /\bhacker\b/i,
      /\bzero[\s-]?day\b/i,
      /\bcves?\b/i,
      /\bvulnerabilidade(s)?\b/i,
      /\brce\b/i
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
      /\bcorre[cç][aã]o\b/i
    ]
  },
  {
    topic: 'ia',
    patterns: [
      /\bintelig[eê]ncia artificial\b/i,
      /\bIA\b/,
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
    topic: 'programacao',
    patterns: [
      /\bdesenvolvimento de software\b/i,
      /\bfront[\s-]?end\b/i,
      /\bback[\s-]?end\b/i,
      /\bfull[\s-]?stack\b/i,
      /\bdesenvolvedor(es|a)?\b/i,
      /\bengenheir[oa]s? de software\b/i,
      /\bjavascript\b/i,
      /\btypescript\b/i,
      /\bpython\b/i,
      /\breact(\s*native)?\b/i,
      /\bnode\.?js\b/i,
      /\bkotlin\b/i,
      /\bswift\b/i,
      /\bframework\b/i,
      /\bgit(hub)?\b/i,
      /\bdevops\b/i,
      /\bopen[\s-]?source\b/i,
      /\bc[oó]digo[\s-]fonte\b/i
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
  const rule = TOPIC_RULES.find(entry => entry.topic === topic)
  return rule ? rule.patterns.some(pattern => pattern.test(text)) : false
}
