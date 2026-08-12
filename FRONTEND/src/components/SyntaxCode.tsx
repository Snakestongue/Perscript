const tokenPattern = /(\/\/.*|#.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:public|private|protected|class|static|final|return|new|void|def|from|import|try|finally|constexpr|const|self|package|extends)\b|\b(?:boolean|bool|char|double|float|int|long|short|String|Command|TalonFX)\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*(?=\s*\())/gm;

const keywords = new Set([
  "public", "private", "protected", "class", "static", "final", "return",
  "new", "def", "from", "import", "try", "finally", "constexpr", "const",
  "self", "package", "extends",
]);
const types = new Set([
  "void", "boolean", "bool", "char", "double", "float", "int", "long",
  "short", "String", "Command", "TalonFX",
]);

function tokenClass(token: string) {
  if (token.startsWith("//") || token.startsWith("#")) return "comment";
  if (token.startsWith('"') || token.startsWith("'")) return "string";
  if (/^\d/.test(token)) return "number";
  if (keywords.has(token)) return "keyword";
  if (types.has(token)) return "type";
  return "function";
}

function SyntaxCode({ code }: { code: string }) {
  return (
    <code>
      {code.split(tokenPattern).map((token, index) => {
        if (!token || !tokenPattern.test(token)) {
          tokenPattern.lastIndex = 0;
          return token;
        }
        tokenPattern.lastIndex = 0;
        return <span className={`code-token ${tokenClass(token)}`} key={`${index}-${token}`}>{token}</span>;
      })}
    </code>
  );
}

export default SyntaxCode;
