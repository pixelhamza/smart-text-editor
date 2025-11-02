export class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const ch of word.toLowerCase()) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  getSuggestions(prefix, limit = 3) {
    let node = this.root;
    for (const ch of prefix.toLowerCase()) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }

    const results = [];
    const dfs = (curr, path) => {
      if (results.length >= limit) return;
      if (curr.isEnd) results.push(prefix + path);
      for (const [ch, next] of Object.entries(curr.children)) dfs(next, path + ch);
    };
    dfs(node, "");
    return results;
  }
}