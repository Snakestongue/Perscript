// Basic, conservative syntax checks for the editors (no compiler involved).
// Catches: unmatched/mismatched brackets, unterminated strings and block
// comments, and obviously missing semicolons (Java / C++ only).

const ERROR = 8; // monaco.MarkerSeverity.Error
const PAIRS = { ")": "(", "]": "[", "}": "{" };
const OPENERS = new Set(["(", "[", "{"]);

function marker(line, col, endCol, message) {
  return { startLineNumber: line, startColumn: col, endLineNumber: line, endColumn: endCol, message, severity: ERROR };
}

// Walks the code once. Returns brackets problems plus a per-line "clean" view
// (comments removed, string contents blanked) used by the semicolon check.
function scan(code, lang) {
  const isPy = lang === "python";
  const lines = code.split("\n");
  const clean = lines.map((l) => l.split(""));
  const problems = [];
  const stack = [];
  let state = "code"; // code | block | triple
  let blockStart = null;
  let tripleQuote = "";

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const out = clean[li];
    let i = 0;
    while (i < line.length) {
      const ch = line[i];
      const two = line.slice(i, i + 2);
      const three = line.slice(i, i + 3);
      if (state === "block") {
        out[i] = " ";
        if (two === "*/") { out[i + 1] = " "; i += 2; state = "code"; continue; }
        i++; continue;
      }
      if (state === "triple") {
        out[i] = " ";
        if (three === tripleQuote) { out[i + 1] = " "; out[i + 2] = " "; i += 3; state = "code"; continue; }
        i++; continue;
      }
      // line comments
      if ((!isPy && two === "//") || (isPy && ch === "#")) {
        for (let k = i; k < line.length; k++) out[k] = " ";
        break;
      }
      if (!isPy && two === "/*") {
        state = "block"; blockStart = { li, col: i + 1 };
        out[i] = " "; out[i + 1] = " "; i += 2; continue;
      }
      // triple-quoted strings / text blocks
      if ((isPy && (three === '"""' || three === "'''")) || (lang === "java" && three === '"""')) {
        state = "triple"; tripleQuote = three; blockStart = { li, col: i + 1 };
        out[i] = out[i + 1] = out[i + 2] = " "; i += 3; continue;
      }
      // strings / chars
      if (ch === '"' || ch === "'") {
        let j = i + 1, closed = false;
        while (j < line.length) {
          if (line[j] === "\\") { j += 2; continue; }
          if (line[j] === ch) { closed = true; break; }
          j++;
        }
        if (!closed) {
          problems.push(marker(li + 1, i + 1, line.length + 1, ch === '"' ? "Unterminated string literal" : "Unterminated character literal"));
          for (let k = i; k < line.length; k++) out[k] = " ";
          break;
        }
        for (let k = i + 1; k < j; k++) out[k] = " ";
        i = j + 1; continue;
      }
      if (OPENERS.has(ch)) stack.push({ ch, li, col: i + 1 });
      else if (PAIRS[ch]) {
        const top = stack[stack.length - 1];
        if (!top) problems.push(marker(li + 1, i + 1, i + 2, `Unexpected '${ch}' with no matching '${PAIRS[ch]}'`));
        else if (top.ch !== PAIRS[ch]) {
          problems.push(marker(li + 1, i + 1, i + 2, `'${ch}' does not match the '${top.ch}' on line ${top.li + 1}`));
          stack.pop();
        } else stack.pop();
      }
      i++;
    }
  }
  if (state === "block" && blockStart) problems.push(marker(blockStart.li + 1, blockStart.col, blockStart.col + 2, "Unterminated comment: missing */"));
  if (state === "triple" && blockStart) problems.push(marker(blockStart.li + 1, blockStart.col, blockStart.col + 3, "Unterminated multi-line string"));
  for (const o of stack) problems.push(marker(o.li + 1, o.col, o.col + 1, `Missing closing '${o.ch === "(" ? ")" : o.ch === "[" ? "]" : "}"}' for this '${o.ch}'`));
  return { problems, clean: clean.map((a) => a.join("")), lines };
}

const NO_SEMI_START = /^(if|else|for|while|do|switch|case|default|try|catch|finally|synchronized|class|interface|enum|record|package|import|namespace|template|using|public|private|protected|static|abstract|void|@|#)\b|^@/;
const DECL = /^(final\s+)?(int|long|short|byte|double|float|boolean|char|String|var|auto)\s+\w+\s*=/;
const FLOW = /^(return|break|continue|throw)\b/;
const ASSIGN = /^[A-Za-z_][\w.[\]]*\s*(=|\+=|-=|\*=|\/=)\s*\S/;
const CALL = /^[A-Za-z_][\w.]*\s*\(.*\)$/;

function semicolonProblems(clean, lang) {
  if (lang === "python") return [];
  const problems = [];
  let depth = 0;
  let parenTotal = 0; // open ( or [ across lines: arguments of a multi-line call
  for (let li = 0; li < clean.length; li++) {
    const raw = clean[li];
    const startDepth = depth;
    const startParen = parenTotal;
    let parenDepth = 0;
    for (const ch of raw) {
      if (ch === "(" || ch === "[") { depth++; parenDepth++; parenTotal++; }
      else if (ch === ")" || ch === "]") { depth--; parenDepth--; parenTotal--; }
      else if (ch === "{") depth++;
      else if (ch === "}") depth--;
    }
    const t = raw.trim();
    if (!t || depth !== startDepth || parenDepth !== 0 || startParen > 0) continue;
    if (/[;{},:(.+\-*/%=&|?<>!^~[]$/.test(t) && !/(\+\+|--)$/.test(t)) continue;
    if (t.endsWith("}") ) continue;
    if (NO_SEMI_START.test(t)) continue;
    // next non-empty line continues the statement or opens a block?
    let nx = "";
    for (let k = li + 1; k < clean.length; k++) { if (clean[k].trim()) { nx = clean[k].trim(); break; } }
    if (/^([.{?:+\-*/%=&|<>^]|throws\b|extends\b|implements\b)/.test(nx)) continue;
    const looksLikeStatement =
      DECL.test(t) || FLOW.test(t) || ASSIGN.test(t) || (CALL.test(t) && nx !== "{");
    if (!looksLikeStatement) continue;
    // method declaration like "Foo bar()" followed by a block on the next line
    if (CALL.test(t) && /^(\w+\s+)+\w+\s*\(/.test(t)) continue;
    const col = raw.length - raw.trimEnd().length;
    problems.push(marker(li + 1, raw.length - col + 1, raw.length - col + 2, "Missing semicolon ';'"));
  }
  return problems;
}

export function lintCode(code, lang) {
  if (!code || !code.trim()) return [];
  const { problems, clean } = scan(code, lang);
  const semis = problems.length === 0 ? semicolonProblems(clean, lang) : [];
  return [...problems, ...semis].slice(0, 20);
}

// Attach live linting to a Monaco editor (language is read from the model).
export function attachLint(monaco, editor) {
  let timer;
  const run = () => {
    const model = editor.getModel();
    if (!model) return;
    monaco.editor.setModelMarkers(model, "perscript-lint", lintCode(model.getValue(), model.getLanguageId()));
  };
  const schedule = () => { clearTimeout(timer); timer = setTimeout(run, 400); };
  editor.onDidChangeModelContent(schedule);
  editor.onDidChangeModelLanguage(run);
  run();
}
