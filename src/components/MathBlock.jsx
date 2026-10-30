import katex from 'katex';

function asTextMode(text) {
  const escape = (value) => value.replaceAll('\\', '\\backslash ').replaceAll('{', '\\{').replaceAll('}', '\\}');
  const subscript = /^(.*?)([^\s]+)₂(.*)$/s.exec(text);
  if (subscript) {
    return `\\text{${escape(subscript[1])}}\\text{${escape(subscript[2])}}_{2}\\text{${escape(subscript[3])}}`;
  }
  return `\\text{${escape(text)}}`;
}

export default function MathBlock({ text, tex }) {
  const expression = tex ?? asTextMode(text ?? '');
  const html = katex.renderToString(expression, {
    displayMode: true,
    output: 'htmlAndMathml',
    throwOnError: false,
    strict: 'ignore',
  });
  return <div className="formula" role="math" aria-label={text ?? tex} dangerouslySetInnerHTML={{ __html: html }} />;
}
