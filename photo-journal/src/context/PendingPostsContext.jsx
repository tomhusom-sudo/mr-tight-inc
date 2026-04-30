import { createContext, useContext, useState, useCallback } from 'react';

const PendingPostsContext = createContext(null);

export function PendingPostsProvider({ children }) {
  const [pending, setPending] = useState([]);

  const add = useCallback((post) => {
    setPending((p) => [post, ...p]);
  }, []);

  const update = useCallback((id, patch) => {
    setPending((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }, []);

  const remove = useCallback((id) => {
    setPending((p) => p.filter((x) => x.id !== id));
  }, []);

  return (
    <PendingPostsContext.Provider value={{ pending, add, update, remove }}>
      {children}
    </PendingPostsContext.Provider>
  );
}

export const usePending = () => useContext(PendingPostsContext);
