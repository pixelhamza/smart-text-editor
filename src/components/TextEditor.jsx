import React, { useState, useEffect, useRef } from "react";
import { Trie } from "./Trie";
import { kmpSearch, escapeHtml } from "./KMP";
import { getCorrection } from "./SpellChecker";

export default function TextEditor() {
  const [text, setText] = useState("Type here. Try words like 'ban', 'app', or misspell a word like 'recieve'.");
  const [pattern, setPattern] = useState("");
  const [matches, setMatches] = useState([]);
  const [current, setCurrent] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);

  const editorRef = useRef(null);
  const trie = useRef(new Trie()).current;

  // preload some words
  useEffect(() => {
    ["apple", "application", "appetite", "banana", "band", "banner", "cat", "cater", "catalog"].forEach(w => trie.insert(w));
  }, [trie]);

  // --- Spellcheck autocorrect ---
  function handleTextChange(e) {
    let value = e.target.value;

    // check last word
    const words = value.split(/\s+/);
    const last = words[words.length - 1];

    if (last.length > 2) {
      const corrected = getCorrection(last);
      if (corrected !== last) {
        value = value.replace(new RegExp(last + "$"), corrected);
      }

      const sug = trie.getSuggestions(last, 3);
      setSuggestions(sug);
    } else {
      setSuggestions([]);
    }

    setText(value);
  }

  // --- KMP search update ---
  useEffect(() => {
    if (!pattern.trim()) {
      setMatches([]);
      setCurrent(-1);
      return;
    }
    const m = kmpSearch(text, pattern);
    setMatches(m);
    setCurrent(m.length ? 0 : -1);
  }, [text, pattern]);

  // --- Highlighting ---
  function highlightText() {
    if (!matches.length) return escapeHtml(text);
    let out = "", last = 0;
    matches.forEach(idx => {
      out += escapeHtml(text.slice(last, idx));
      out += `<mark class="match">${escapeHtml(text.slice(idx, idx + pattern.length))}</mark>`;
      last = idx + pattern.length;
    });
    out += escapeHtml(text.slice(last));
    return out;
  }

  useEffect(() => {
    if (!editorRef.current) return;
    const marks = editorRef.current.querySelectorAll("mark.match");
    if (marks.length === 0 || current < 0) return;
    const el = marks[current];
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [current]);

  function handleSuggestionClick(word) {
    const words = text.split(/\s+/);
    words[words.length - 1] = word;
    setText(words.join(" ") + " ");
    setSuggestions([]);
  }

  return (
    <div style={styles.container}>
      <h3>React Text Editor + KMP + Trie + SpellChecker</h3>

      <div style={styles.toolbar}>
        <textarea
          style={styles.textarea}
          value={text}
          onChange={handleTextChange}
          placeholder="Type text..."
        />

        <div style={styles.controls}>
          <input
            style={styles.input}
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Search pattern"
          />
          <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
            <button onClick={() => setCurrent((c) => (matches.length ? (c - 1 + matches.length) % matches.length : -1))}>Prev</button>
            <button onClick={() => setCurrent((c) => (matches.length ? (c + 1) % matches.length : -1))}>Next</button>
          </div>
          <small style={{ color: "#777" }}>
            Matches: {matches.length} {matches.length ? `— ${current + 1}/${matches.length}` : ""}
          </small>

          {suggestions.length > 0 && (
            <div style={styles.suggestions}>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  style={styles.suggestionItem}
                  onClick={() => handleSuggestionClick(s)}
                >
                  💡 Do you want to type this? <b>{s}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        ref={editorRef}
        style={styles.preview}
        dangerouslySetInnerHTML={{ __html: highlightText() }}
      />
    </div>
  );
}

const styles = {
  container: { fontFamily: "system-ui, sans-serif", maxWidth: "900px", margin: "20px auto" },
  toolbar: { display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "12px" },
  textarea: { flex: 1, minHeight: "220px", borderRadius: "8px", border: "1px solid #ddd", padding: "10px", fontFamily: "monospace" },
  controls: { width: "260px", display: "flex", flexDirection: "column", position: "relative" },
  input: { padding: "8px", border: "1px solid #ddd", borderRadius: "6px" },
  preview: { background: "white", border: "1px solid #ddd", borderRadius: "8px", padding: "12px", whiteSpace: "pre-wrap", overflow: "auto", minHeight: "180px" },
  suggestions: { position: "absolute", top: "90px", left: "0", background: "#fff", border: "1px solid #ddd", borderRadius: "6px", padding: "4px", width: "100%" },
  suggestionItem: { padding: "6px 8px", cursor: "pointer" }
};