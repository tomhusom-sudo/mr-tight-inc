// Honest Tom's Dashboard — Gist Sync
// Syncs music picks, Timmy's tips & articles across all devices via a private GitHub Gist.
// Requires a GitHub Personal Access Token with `gist` scope.

var GistSync = (function () {
  var TOKEN_KEY  = 'bacon_sync_token';
  var GIST_KEY   = 'bacon_sync_gist_id';
  var CACHE_KEY  = 'bacon_sync_cache';
  var FILE       = 'bacon_dashboard.json';

  function tok()    { return localStorage.getItem(TOKEN_KEY) || ''; }
  function gistId() { return localStorage.getItem(GIST_KEY)  || ''; }
  function setTok(t)  { localStorage.setItem(TOKEN_KEY, t.trim()); }
  function setGist(id){ localStorage.setItem(GIST_KEY,  id.trim()); }

  function isConfigured() { return !!(tok() && gistId()); }

  function hdrs() {
    return {
      'Authorization': 'token ' + tok(),
      'Content-Type':  'application/json',
      'Accept':        'application/vnd.github.v3+json'
    };
  }

  // ── Cache (localStorage mirror of the Gist JSON) ──
  function getCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
    catch(e) { return {}; }
  }
  function setCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch(e) {}
  }

  // ── Pull: fetch Gist → update cache ──
  function pull(cb) {
    var id = gistId(), t = tok();
    if (!id || !t) { cb(null, 'not_configured'); return; }
    fetch('https://api.github.com/gists/' + id, { headers: hdrs() })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var f = d.files && d.files[FILE];
        if (!f) { cb({}, null); return; }
        try {
          var parsed = JSON.parse(f.content || '{}');
          setCache(parsed);
          cb(parsed, null);
        } catch(e) { cb(null, 'parse_error'); }
      })
      .catch(function() { cb(null, 'network_error'); });
  }

  // ── Push: write cache → Gist (single request) ──
  function push(data, cb) {
    var t = tok(), id = gistId();
    if (!t) { if (cb) cb(false, 'no_token'); return; }
    setCache(data);
    var files = {};
    files[FILE] = { content: JSON.stringify(data, null, 2) };
    var isNew = !id;
    fetch(isNew ? 'https://api.github.com/gists' : 'https://api.github.com/gists/' + id, {
      method: isNew ? 'POST' : 'PATCH',
      headers: hdrs(),
      body: isNew
        ? JSON.stringify({ description: "Honest Tom's Dashboard", public: false, files: files })
        : JSON.stringify({ files: files })
    })
      .then(function(r) { return r.json(); })
      .then(function(resp) {
        if (isNew && resp.id) setGist(resp.id);
        if (cb) cb(!!(resp.id || resp.files), null);
      })
      .catch(function() { if (cb) cb(false, 'network_error'); });
  }

  // ── Get one section from the live Gist ──
  function getSection(key, cb) {
    pull(function(d, e) { cb(e ? null : (d[key] || null), e); });
  }

  // ── Set one section — pulls live Gist first, merges, then pushes ──
  function setSection(key, val, cb) {
    pull(function(live, err) {
      var data = (live && !err) ? live : getCache();
      data[key] = val;
      data._updated = new Date().toISOString();
      push(data, cb || function() {});
    });
  }

  // ── First-time setup: search user's Gists for ours, else create one ──
  function findOrCreate(cb) {
    if (!tok()) { cb(false, 'no_token'); return; }
    fetch('https://api.github.com/gists?per_page=100', { headers: hdrs() })
      .then(function(r) { return r.json(); })
      .then(function(list) {
        if (!Array.isArray(list)) { cb(false, 'auth_failed'); return; }
        for (var i = 0; i < list.length; i++) {
          if (list[i].files && list[i].files[FILE]) {
            setGist(list[i].id);
            cb(true, 'found');
            return;
          }
        }
        // Not found — create a fresh one
        push({}, function(ok, err) { cb(ok, ok ? 'created' : err); });
      })
      .catch(function() { cb(false, 'network_error'); });
  }

  return {
    isConfigured: isConfigured,
    getToken:     tok,
    getGistId:    gistId,
    setToken:     setTok,
    pull:         pull,
    push:         push,
    getSection:   getSection,
    setSection:   setSection,
    findOrCreate: findOrCreate
  };
})();
