// Semantic checks for Python (tree-sitter-python tree): undefined names, missing imports, call shapes for
// functions and classes defined in the same file, attributes that were never assigned, missing returns,
// unreachable code, duplicate definitions and parameters, simple literal type mismatches.
// Conservative: a name is "defined" if it is bound ANYWHERE in the file or an enclosing function, so the
// checker never reports code that runs; and a file with `from x import *` is not checked for names at all.

const BUILTINS = new Set(("abs aiter all anext any ascii bin bool breakpoint bytearray bytes callable chr classmethod compile complex copyright credits delattr dict dir divmod enumerate eval exec exit " +
  "filter float format frozenset getattr globals hasattr hash help hex id input int isinstance issubclass iter len license list locals map max memoryview min next object oct open ord pow print property " +
  "quit range repr reversed round set setattr slice sorted staticmethod str sum super tuple type vars zip __import__ __name__ __file__ __doc__ __package__ __spec__ __builtins__ __debug__ NotImplemented Ellipsis " +
  "None True False self cls BaseException Exception ArithmeticError AssertionError AttributeError BufferError EOFError FloatingPointError GeneratorExit ImportError IndexError KeyError KeyboardInterrupt " +
  "LookupError MemoryError ModuleNotFoundError NameError NotImplementedError OSError OverflowError RecursionError ReferenceError RuntimeError StopAsyncIteration StopIteration SyntaxError SystemError " +
  "SystemExit TabError TimeoutError TypeError UnboundLocalError UnicodeError ValueError ZeroDivisionError IOError EnvironmentError FileNotFoundError PermissionError ConnectionError Warning " +
  "DeprecationWarning UserWarning RuntimeWarning ExceptionGroup BaseExceptionGroup").split(" "));

// Names people use without importing them: tell them which import fixes it.
const MODULE_HINTS = {
  math: "import math", os: "import os", sys: "import sys", time: "import time", random: "import random", json: "import json", re: "import re",
  collections: "import collections", itertools: "import itertools", functools: "import functools", typing: "import typing", dataclasses: "import dataclasses",
  enum: "import enum", pathlib: "import pathlib", datetime: "import datetime", logging: "import logging", threading: "import threading",
  wpilib: "import wpilib", commands2: "import commands2", wpimath: "import wpimath", phoenix6: "import phoenix6", rev: "import rev", navx: "import navx", ntcore: "import ntcore",
  List: "from typing import List", Dict: "from typing import Dict", Optional: "from typing import Optional", Tuple: "from typing import Tuple", Set: "from typing import Set",
  Union: "from typing import Union", Callable: "from typing import Callable", Any: "from typing import Any", dataclass: "from dataclasses import dataclass",
  Enum: "from enum import Enum", Path: "from pathlib import Path", defaultdict: "from collections import defaultdict", deque: "from collections import deque",
};

function editDistance(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function closest(name, candidates) {
  let best = null, bestD = Infinity;
  for (const c of new Set(candidates)) { const dist = editDistance(name.toLowerCase(), c.toLowerCase()); if (dist < bestD) { bestD = dist; best = c; } }
  return best && bestD <= Math.max(1, Math.floor(name.length / 3)) ? best : null;
}

export function diagnosePython(parse, src) {
  const tree = parse(src);
  if (!tree || tree.rootNode.hasError()) return [];
  const root = tree.rootNode;
  const out = [];
  const report = (node, message, severity = "error") =>
    out.push({ startLine: node.startPosition.row + 1, startCol: node.startPosition.column + 1, endLine: node.endPosition.row + 1, endCol: node.endPosition.column + 1, message, severity });
  const walk = (n, fn) => { fn(n); for (const c of n.namedChildren) walk(c, fn); };

  const FUNC = "function_definition", CLASS = "class_definition";
  const hasStar = root.descendantsOfType("wildcard_import").length > 0;

  // ---- name binding ------------------------------------------------------------
  const bindTargets = (t, into) => {
    if (!t) return;
    if (t.type === "identifier") into.add(t.text);
    else if (["pattern_list", "tuple_pattern", "list_pattern", "list_splat_pattern", "parenthesized_expression", "tuple", "list", "expression_list"].includes(t.type)) for (const c of t.namedChildren) bindTargets(c, into);
  };
  // Names bound directly in a scope (not inside nested functions/classes). Comprehension and lambda names count too.
  const boundIn = (scope) => {
    const names = new Set();
    const visit = (n, top) => {
      for (const c of n.namedChildren) {
        switch (c.type) {
          case FUNC: names.add(c.childForFieldName("name").text); continue;
          case CLASS: names.add(c.childForFieldName("name").text); continue;
          case "decorated_definition": visit(c, false); continue;
          case "assignment": case "augmented_assignment": bindTargets(c.childForFieldName("left"), names); break;
          case "for_statement": case "for_in_clause": bindTargets(c.childForFieldName("left"), names); break;
          case "named_expression": bindTargets(c.childForFieldName("name"), names); break;
          case "as_pattern_target": bindTargets(c.namedChildren[0], names); break;
          case "import_statement": for (const x of c.namedChildren) { if (x.type === "aliased_import") names.add(x.childForFieldName("alias").text); else if (x.type === "dotted_name") names.add(x.namedChildren[0].text); } break;
          case "import_from_statement": for (const x of c.namedChildren.slice(1)) { if (x.type === "aliased_import") names.add(x.childForFieldName("alias").text); else if (x.type === "dotted_name") names.add(x.namedChildren.pop()?.text ?? x.text); } break;
          case "global_statement": case "nonlocal_statement": for (const x of c.namedChildren) names.add(x.text); break;
          case "lambda": for (const p of c.childForFieldName("parameters")?.namedChildren || []) bindTargets(p.type === "default_parameter" ? p.childForFieldName("name") : p, names); break;
          case "case_pattern": case "case_clause": walk(c, (x) => { if (x.type === "identifier") names.add(x.text); }); break;
          default: break;
        }
        if (c.type === FUNC || c.type === CLASS) continue;
        visit(c, false);
      }
      void top;
    };
    visit(scope, true);
    return names;
  };
  const paramNames = (fn) => {
    const names = [];
    for (const p of fn.childForFieldName("parameters")?.namedChildren || []) {
      const id = p.type === "identifier" ? p : p.type === "default_parameter" || p.type === "typed_parameter" || p.type === "typed_default_parameter" ? (p.childForFieldName("name") || p.namedChildren[0]) : p.namedChildren[0];
      if (id && id.type === "identifier") names.push(id);
    }
    return names;
  };

  const moduleNames = boundIn(root);
  // names declared `global` inside functions also exist at module level
  const scopeCache = new Map();
  const scopeNamesOf = (fn) => {
    if (scopeCache.has(fn.id)) return scopeCache.get(fn.id);
    const s = boundIn(fn.childForFieldName("body") || fn);
    for (const p of paramNames(fn)) s.add(p.text);
    if (fn.type === "lambda") for (const p of fn.childForFieldName("parameters")?.namedChildren || []) bindTargets(p.type === "default_parameter" ? p.childForFieldName("name") : p, s);
    scopeCache.set(fn.id, s);
    return s;
  };
  const classNames = new Map();
  const visibleNames = (n) => {
    const names = new Set(moduleNames);
    let p = n, directClass = null, prev = n;
    while (p) {
      if (p.type === FUNC || p.type === "lambda") for (const x of scopeNamesOf(p)) names.add(x);
      if (p.type === CLASS && prev.id === p.childForFieldName("body")?.id) directClass = p;
      prev = p; p = p.parent;
    }
    if (directClass) { if (!classNames.has(directClass.id)) classNames.set(directClass.id, boundIn(directClass.childForFieldName("body"))); for (const x of classNames.get(directClass.id)) names.add(x); }
    return names;
  };

  // ---- 1. undefined names + missing imports -------------------------------------
  const importedNames = new Map(); // local name -> import node (for unused warnings)
  walk(root, (n) => {
    if (n.type === "import_statement") for (const x of n.namedChildren) { const id = x.type === "aliased_import" ? x.childForFieldName("alias") : x.namedChildren[0]; if (id) importedNames.set(id.text, n); }
    else if (n.type === "import_from_statement") for (const x of n.namedChildren.slice(1)) { const id = x.type === "aliased_import" ? x.childForFieldName("alias") : x.type === "dotted_name" ? x.namedChildren[x.namedChildren.length - 1] : null; if (id) importedNames.set(id.text, n); }
  });
  const loads = new Set();
  const isBindingPosition = (n) => {
    const p = n.parent; if (!p) return true;
    const t = p.type;
    if (t === "attribute") return p.childForFieldName("object")?.id !== n.id;
    if (t === "keyword_argument") return p.childForFieldName("name")?.id === n.id;
    if (t === FUNC || t === CLASS) return p.childForFieldName("name")?.id === n.id;
    if (["parameters", "lambda_parameters", "default_parameter", "typed_parameter", "typed_default_parameter", "list_splat_pattern", "dictionary_splat_pattern", "import_statement", "import_from_statement", "dotted_name", "aliased_import", "global_statement", "nonlocal_statement", "as_pattern_target", "relative_import", "import_prefix", "case_pattern", "keyword_pattern", "dotted_name"].includes(t)) {
      if ((t === "default_parameter" || t === "typed_default_parameter") && p.childForFieldName("value")?.id === n.id) return false;
      if ((t === "typed_parameter" || t === "typed_default_parameter") && p.childForFieldName("type")?.id === n.id) return false;
      return true;
    }
    if (t === "assignment" || t === "augmented_assignment") return p.childForFieldName("left")?.id === n.id;
    if (t === "for_statement" || t === "for_in_clause") return p.childForFieldName("left")?.id === n.id;
    if (t === "named_expression") return p.childForFieldName("name")?.id === n.id;
    if (["pattern_list", "tuple_pattern", "list_pattern"].includes(t)) return true;
    return false;
  };
  if (!hasStar) {
    walk(root, (n) => {
      if (n.type !== "identifier" || isBindingPosition(n)) return;
      loads.add(n.text);
      const name = n.text;
      if (BUILTINS.has(name) || visibleNames(n).has(name)) return;
      const hint = MODULE_HINTS[name];
      if (hint) { report(n, `name '${name}' is not defined. Add: ${hint}`); return; }
      const near = closest(name, [...visibleNames(n), ...BUILTINS]);
      report(n, `name '${name}' is not defined${near ? `. Did you mean '${near}'?` : ""}`);
    });
  } else walk(root, (n) => { if (n.type === "identifier" && !isBindingPosition(n)) loads.add(n.text); });

  // unused imports
  for (const [name, node] of importedNames) if (!loads.has(name) && node.parent?.id === root.id && !/__all__/.test(src)) report(node, `'${name}' is imported but never used`, "warning");

  // ---- 2. functions: arity, duplicates, parameters --------------------------------
  const sigOf = (fn, dropFirst) => {
    const sig = { pos: 0, required: [], names: new Set(), star: false, kwstar: false, kwOnly: new Set(), kwOnlyRequired: [] };
    let seenStar = false, idx = 0;
    for (const p of fn.childForFieldName("parameters")?.namedChildren || []) {
      if (p.type === "list_splat_pattern") { sig.star = true; seenStar = true; continue; }
      if (p.type === "keyword_separator") { seenStar = true; continue; }
      if (p.type === "positional_separator") continue;
      if (p.type === "dictionary_splat_pattern") { sig.kwstar = true; continue; }
      const id = p.type === "identifier" ? p : (p.childForFieldName("name") || p.namedChildren[0]);
      if (!id) continue;
      const hasDefault = p.type === "default_parameter" || p.type === "typed_default_parameter";
      if (idx === 0 && dropFirst) { idx++; continue; }
      idx++;
      if (seenStar) { sig.kwOnly.add(id.text); if (!hasDefault) sig.kwOnlyRequired.push(id.text); }
      else { sig.pos++; sig.names.add(id.text); if (!hasDefault) sig.required.push(id.text); }
    }
    return sig;
  };
  const decoratorsOf = (fn) => (fn.parent?.type === "decorated_definition" ? fn.parent.namedChildren.filter((c) => c.type === "decorator").map((d) => d.text.replace(/^@\s*/, "")) : []);

  // duplicate parameters and duplicate definitions
  walk(root, (n) => {
    if (n.type === FUNC) {
      const seen = new Set();
      for (const id of paramNames(n)) { if (seen.has(id.text)) report(id, `Duplicate parameter '${id.text}'`); else seen.add(id.text); }
    }
    if (n.type === "module" || n.type === "block") {
      const seen = new Map();
      for (const c of n.namedChildren) {
        const def = c.type === "decorated_definition" ? c.namedChildren.find((x) => x.type === FUNC || x.type === CLASS) : c;
        if (!def || (def.type !== FUNC && def.type !== CLASS)) continue;
        const decs = c.type === "decorated_definition" ? decoratorsOf(def) : [];
        const nm = def.childForFieldName("name").text;
        if (decs.some((d) => /overload|setter|getter|deleter|register|singledispatch/.test(d))) continue;
        if (seen.has(nm)) report(def.childForFieldName("name"), `'${nm}' is already defined on line ${seen.get(nm)}`, "warning");
        else seen.set(nm, def.startPosition.row + 1);
      }
    }
  });

  // definitions usable for arity checks: defined exactly once, undecorated
  const defCount = new Map();
  walk(root, (n) => { if (n.type === FUNC || n.type === CLASS) { const k = n.childForFieldName("name").text; defCount.set(k, (defCount.get(k) || 0) + 1); } });
  const moduleFuncs = new Map(), moduleClasses = new Map();
  for (const c of root.namedChildren) {
    if (c.type === FUNC && defCount.get(c.childForFieldName("name").text) === 1) moduleFuncs.set(c.childForFieldName("name").text, c);
    if (c.type === CLASS && defCount.get(c.childForFieldName("name").text) === 1) moduleClasses.set(c.childForFieldName("name").text, c);
  }
  const classBody = (cls) => cls.childForFieldName("body")?.namedChildren || [];
  const methodsOf = (cls) => {
    const m = new Map(), cnt = new Map();
    for (const c of classBody(cls)) {
      const def = c.type === "decorated_definition" ? c.namedChildren.find((x) => x.type === FUNC) : c.type === FUNC ? c : null;
      if (!def) continue;
      const nm = def.childForFieldName("name").text;
      cnt.set(nm, (cnt.get(nm) || 0) + 1);
      m.set(nm, def);
    }
    for (const [k, v] of cnt) if (v > 1) m.delete(k);
    return m;
  };
  const classBases = (cls) => (cls.childForFieldName("superclasses")?.namedChildren || []).filter((x) => x.type !== "keyword_argument");
  const simpleClass = (cls) => classBases(cls).every((b) => b.type === "identifier" && (b.text === "object" || moduleClasses.has(b.text)));
  const classChain = (cls, seen = new Set()) => { // the class and its in-file bases
    if (seen.has(cls.id)) return [];
    seen.add(cls.id);
    const out2 = [cls];
    for (const b of classBases(cls)) if (b.type === "identifier" && moduleClasses.has(b.text)) out2.push(...classChain(moduleClasses.get(b.text), seen));
    return out2;
  };

  const checkCall = (call, fn, dropFirst, label) => {
    const args = call.childForFieldName("arguments")?.namedChildren || [];
    if (args.some((a) => a.type === "list_splat" || a.type === "dictionary_splat")) return;
    if (decoratorsOf(fn).length) return;
    const sig = sigOf(fn, dropFirst);
    const positional = args.filter((a) => a.type !== "keyword_argument");
    const kws = args.filter((a) => a.type === "keyword_argument").map((a) => a.childForFieldName("name").text);
    if (positional.length > sig.pos && !sig.star) { report(call, `${label}() takes ${sig.pos} positional argument${sig.pos === 1 ? "" : "s"} but ${positional.length} ${positional.length === 1 ? "was" : "were"} given`); return; }
    for (const k of kws) if (!sig.kwstar && !sig.names.has(k) && !sig.kwOnly.has(k)) { report(call, `${label}() got an unexpected keyword argument '${k}'`); return; }
    const given = new Set(kws);
    const missing = sig.required.filter((nm, i) => i >= positional.length && !given.has(nm)).concat(sig.kwOnlyRequired.filter((nm) => !given.has(nm)));
    if (missing.length) report(call, `${label}() missing required argument${missing.length > 1 ? "s" : ""}: ${missing.map((m) => `'${m}'`).join(", ")}`);
  };

  const enclosingClass = (n) => { let p = n.parent; while (p) { if (p.type === CLASS) return p; if (p.type === FUNC && p.parent?.type !== "block") { /* keep climbing */ } p = p.parent; } return null; };
  walk(root, (n) => {
    if (n.type !== "call") return;
    const f = n.childForFieldName("function");
    if (!f) return;
    if (f.type === "identifier") {
      if (moduleFuncs.has(f.text)) { const scoped = visibleNames(n); void scoped; checkCall(n, moduleFuncs.get(f.text), false, f.text); }
      else if (moduleClasses.has(f.text)) {
        const cls = moduleClasses.get(f.text);
        if (decoratorsOf(cls).length || !simpleClass(cls)) return;
        const init = classChain(cls).map((c) => methodsOf(c).get("__init__")).find(Boolean);
        if (init) checkCall(n, init, true, f.text);
        else if (classChain(cls).every((c) => !methodsOf(c).has("__init__")) && !classBody(cls).some((c) => c.type === "decorated_definition") && (n.childForFieldName("arguments")?.namedChildren.length || 0) > 0) report(n, `${f.text}() takes no arguments (the class has no __init__)`);
      }
    } else if (f.type === "attribute" && f.childForFieldName("object")?.text === "self") {
      const cls = enclosingClass(n);
      if (!cls || !simpleClass(cls)) return;
      const name = f.childForFieldName("attribute").text;
      const m = classChain(cls).map((c) => methodsOf(c).get(name)).find(Boolean);
      if (m && !decoratorsOf(m).some((d) => /staticmethod|classmethod/.test(d))) checkCall(n, m, true, `self.${name}`);
    }
  });

  // ---- 3. attributes that were never assigned -----------------------------------
  for (const cls of root.descendantsOfType(CLASS)) {
    if (!simpleClass(cls) || decoratorsOf(cls).length) continue;
    const chain = classChain(cls);
    const attrs = new Set();
    let dynamic = false;
    for (const c of chain) {
      for (const x of boundIn(c.childForFieldName("body"))) attrs.add(x);
      walk(c, (n) => {
        if (n.type === "attribute" && n.childForFieldName("object")?.text === "self") {
          const par = n.parent;
          if ((par.type === "assignment" || par.type === "augmented_assignment") && par.childForFieldName("left")?.id === n.id) attrs.add(n.childForFieldName("attribute").text);
          if (par.type === "pattern_list" || par.type === "tuple_pattern" || par.type === "for_statement") attrs.add(n.childForFieldName("attribute").text);
        }
        if (n.type === "call" && ["setattr", "getattr", "vars", "__dict__"].includes(n.childForFieldName("function")?.text)) dynamic = true;
        if (n.type === "identifier" && ["__slots__", "__getattr__", "__getattribute__", "__dict__"].includes(n.text)) dynamic = true;
      });
    }
    if (dynamic) continue;
    walk(cls, (n) => {
      if (n.type !== "attribute" || n.childForFieldName("object")?.text !== "self") return;
      const nm = n.childForFieldName("attribute").text;
      if (/^__\w+__$/.test(nm) || attrs.has(nm)) return;
      const par = n.parent;
      if ((par.type === "assignment" || par.type === "augmented_assignment") && par.childForFieldName("left")?.id === n.id) return;
      const near = closest(nm, [...attrs]);
      report(n.childForFieldName("attribute"), `'${cls.childForFieldName("name").text}' has no attribute '${nm}'${near ? `. Did you mean '${near}'?` : ""}`);
    });
  }

  // ---- 4. control flow ------------------------------------------------------------
  const EXITS = new Set(["sys.exit", "exit", "quit", "os._exit", "os.abort"]);
  const breaksOut = (loop) => {
    let any = false;
    const visit = (n, nested) => { for (const c of n.namedChildren) { if (c.type === "break_statement") { if (!nested) any = true; continue; } if (c.type === FUNC || c.type === CLASS || c.type === "lambda") continue; visit(c, nested || c.type === "for_statement" || c.type === "while_statement"); } };
    visit(loop.childForFieldName("body") || loop, false);
    return any ? "yes" : "no";
  };
  const or = (a, b) => (a === "yes" || b === "yes" ? "yes" : a === "no" && b === "no" ? "no" : "maybe");
  const stmts = (b) => (b?.namedChildren || []).filter((c) => c.type !== "comment");
  function completes(s) {
    if (!s) return "yes";
    switch (s.type) {
      case "return_statement": case "raise_statement": case "break_statement": case "continue_statement": return "no";
      case "block": { let r = "yes"; for (const st of stmts(s)) { r = completes(st); if (r !== "yes") return r; } return r; }
      case "if_statement": {
        let r = completes(s.childForFieldName("consequence"));
        let hasElse = false;
        for (const c of s.namedChildren) {
          if (c.type === "elif_clause") r = or(r, completes(c.childForFieldName("consequence")));
          if (c.type === "else_clause") { hasElse = true; r = or(r, completes(c.childForFieldName("body"))); }
        }
        return hasElse ? r : "yes";
      }
      case "while_statement": return s.childForFieldName("condition")?.type === "true" ? breaksOut(s) : "yes";
      case "for_statement": return "yes";
      case "try_statement": {
        const fin = s.namedChildren.find((c) => c.type === "finally_clause");
        if (fin && completes(fin.namedChildren.find((c) => c.type === "block")) === "no") return "no";
        let r = completes(s.childForFieldName("body"));
        for (const c of s.namedChildren.filter((x) => x.type === "except_clause" || x.type === "except_group_clause")) r = or(r, completes(c.namedChildren.find((x) => x.type === "block")));
        const els = s.namedChildren.find((c) => c.type === "else_clause");
        if (els && r === "yes") r = completes(els.childForFieldName("body"));
        return r;
      }
      case "with_statement": { const r = completes(s.childForFieldName("body")); return r === "no" ? "maybe" : r; } // a context manager may swallow errors
      case "expression_statement": { const c = s.namedChildren[0]; if (c?.type === "call" && EXITS.has(c.childForFieldName("function")?.text)) return "no"; return "yes"; }
      case "assert_statement": case "pass_statement": case "import_statement": case "import_from_statement": case "global_statement": case "nonlocal_statement": case "delete_statement": case "print_statement": return "yes";
      case "function_definition": case "class_definition": case "decorated_definition": return "yes";
      default: return "maybe"; // match, anything unfamiliar
    }
  }
  walk(root, (n) => {
    if (n.type !== "block" && n.type !== "module") return;
    const sts = stmts(n);
    for (let i = 0; i + 1 < sts.length; i++) if (completes(sts[i]) === "no") { report(sts[i + 1], "Unreachable code: nothing before this line lets it run", "warning"); break; }
  });

  const typeName = (t) => t?.text?.replace(/\s+/g, "");
  const isStub = (body) => stmts(body).every((c) => c.type === "pass_statement" || (c.type === "expression_statement" && (c.namedChildren[0]?.type === "ellipsis" || c.namedChildren[0]?.type === "string")) || (c.type === "raise_statement" && /NotImplementedError/.test(c.text)));
  for (const fn of root.descendantsOfType(FUNC)) {
    const body = fn.childForFieldName("body");
    if (!body || isStub(body)) continue;
    const decs = decoratorsOf(fn);
    if (decs.some((d) => /abstract|overload|property/.test(d))) continue;
    if (body.descendantsOfType(["yield", "yield_expression", "await"]).length || /\byield\b/.test(body.text)) continue;
    const ret = typeName(fn.childForFieldName("return_type"));
    const returns = body.descendantsOfType("return_statement").filter((r) => { let p = r.parent; while (p && p.type !== FUNC) p = p.parent; return p?.id === fn.id; });
    const valueReturns = returns.filter((r) => r.namedChildren.length > 0 && r.namedChildren[0].type !== "none");
    const finishes = completes(body) === "yes";
    if (ret && ret !== "None" && finishes) report(fn.childForFieldName("name"), `Missing return: '${fn.childForFieldName("name").text}' is declared '-> ${ret}' but can reach the end without returning a value`);
    else if (!ret && valueReturns.length && finishes) report(fn.childForFieldName("name"), `Some paths in '${fn.childForFieldName("name").text}' return a value but others reach the end and return None`, "warning");
  }

  // ---- 5. simple literal type mismatches ------------------------------------------
  const literalKind = (v) => {
    if (!v) return null;
    switch (v.type) {
      case "string": case "concatenated_string": return v.text.startsWith("f") || v.text.startsWith("F") ? null : "str";
      case "integer": return "int";
      case "float": return "float";
      case "true": case "false": return "bool";
      case "none": return "None";
      case "list": return "list";
      case "dictionary": return "dict";
      case "unary_operator": { const k = literalKind(v.namedChildren[0]); return k === "int" || k === "float" ? k : null; }
      default: return null;
    }
  };
  const FIT = { int: ["int", "bool"], float: ["float", "int", "bool"], str: ["str"], bool: ["bool"], list: ["list"], dict: ["dict"] };
  const mismatch = (annotation, v) => {
    const want = annotation?.text;
    if (!want || !FIT[want]) return null;
    const got = literalKind(v);
    if (!got || got === "None") return null;
    return FIT[want].includes(got) ? null : `Type mismatch: a ${got} value where '${want}' is declared`;
  };
  walk(root, (n) => {
    if (n.type === "assignment" && n.childForFieldName("type")) {
      const msg = mismatch(n.childForFieldName("type"), n.childForFieldName("right"));
      if (msg) report(n.childForFieldName("right"), msg);
    } else if (n.type === "typed_default_parameter") {
      const msg = mismatch(n.childForFieldName("type"), n.childForFieldName("value"));
      if (msg) report(n.childForFieldName("value"), msg);
    } else if (n.type === "return_statement") {
      let p = n.parent; while (p && p.type !== FUNC) p = p.parent;
      if (!p) return;
      const rt = p.childForFieldName("return_type");
      const v = n.namedChildren[0];
      if (rt?.text === "None" && v && v.type !== "none") report(v, "Type mismatch: returns a value but the function is declared '-> None'");
      else { const msg = mismatch(rt, v); if (msg) report(v, msg); }
    }
  });

  const seen = new Set();
  return out.filter((d) => { const k = `${d.startLine}:${d.startCol}:${d.message}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => a.startLine - b.startLine || a.startCol - b.startCol).slice(0, 40);
}
