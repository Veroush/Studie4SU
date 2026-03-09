'use strict';

window.FavSync = (() => {

  function getToken() {
    return localStorage.getItem('auth_token');
  }

  function authHeaders() {
    const token = getToken();
    return token
      ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      : { 'Content-Type': 'application/json' };
  }

  function isLoggedIn() {
    const token = getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  }

  // Load favorites from DB into localStorage
  async function loadFromDB() {
    if (!isLoggedIn()) return;
    try {
      const res = await fetch('/favorites/me', { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      localStorage.setItem('fav_schools',    JSON.stringify(data.schools    || []));
      localStorage.setItem('fav_programs',   JSON.stringify(data.programs   || []));
      localStorage.setItem('fav_openhouses', JSON.stringify(data.openhouses || []));
    } catch (err) {
      console.warn('[FavSync] Could not load from DB:', err.message);
    }
  }

  // Toggle a favorite — syncs to DB if logged in
  // type: 'schools' | 'programs' | 'openhouses'
  // Returns: true if now favorited, false if removed
  async function toggle(type, id) {
    const key = `fav_${type}`;
    let favs;
    try { favs = JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { favs = []; }

    const idx = favs.indexOf(id);
    const adding = idx === -1;

    // Update localStorage immediately
    if (adding) favs.push(id);
    else         favs.splice(idx, 1);
    localStorage.setItem(key, JSON.stringify(favs));

    // Sync to DB if logged in
    if (isLoggedIn()) {
      try {
        const bodyKey = type === 'schools'  ? 'schoolId'
                      : type === 'programs' ? 'programId'
                      :                       'openHouseId';
        if (adding) {
          await fetch(`/favorites/${type}`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ [bodyKey]: id }),
          });
        } else {
          await fetch(`/favorites/${type}/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
          });
        }
      } catch (err) {
        console.warn('[FavSync] DB sync failed:', err.message);
      }
    }

    return adding;
  }

  function isFav(type, id) {
    try {
      return (JSON.parse(localStorage.getItem(`fav_${type}`) || '[]')).includes(id);
    } catch { return false; }
  }

  return { loadFromDB, toggle, isFav, isLoggedIn };
})();