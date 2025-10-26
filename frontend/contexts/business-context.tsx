"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type BusinessContextType = {
  id: string;
  name: string;
  content: string;
  isSelected?: boolean;
};

type BusinessContextState = {
  formattedContext: string;
  contexts: BusinessContextType[];
  selectedContext: BusinessContextType | null;
  addContext: (context: Omit<BusinessContextType, "id">) => BusinessContextType;
  updateContext: (id: string, updates: Partial<BusinessContextType>) => void;
  removeContext: (id: string) => void;
  selectContext: (id: string | null) => void;
  getContext: (id: string) => BusinessContextType | undefined;
};

const BusinessContext = createContext<BusinessContextState | undefined>(
  undefined
);

const LOCAL_STORAGE_KEY = "businessContexts";
const SELECTED_CONTEXT_ID_KEY = "selectedBusinessContextId";

export function BusinessContextProvider({ children }: { children: ReactNode }) {
  const [contexts, setContexts] = useState<BusinessContextType[]>([]);
  const [selectedContext, setSelectedContext] =
    useState<BusinessContextType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsedContexts = JSON.parse(saved);
          setContexts(parsedContexts);

          const savedSelectedId = localStorage.getItem(SELECTED_CONTEXT_ID_KEY);
          if (savedSelectedId) {
            const selected = parsedContexts.find(
              (ctx: BusinessContextType) => ctx.id === savedSelectedId
            );
            if (selected) {
              setSelectedContext(selected);
            }
          }
        } catch (error) {
          console.error("Error parsing saved contexts:", error);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever contexts change
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contexts));
    }
  }, [contexts, isLoaded]);

  const addContext = (
    context: Omit<BusinessContextType, "id">
  ): BusinessContextType => {
    const newContext = {
      ...context,
      id: Date.now().toString(),
      isSelected: false,
    };
    setContexts((prev) => [...prev, newContext]);
    return newContext;
  };

  const updateContext = (id: string, updates: Partial<BusinessContextType>) => {
    setContexts((prev) =>
      prev.map((ctx) => (ctx.id === id ? { ...ctx, ...updates } : ctx))
    );
    if (selectedContext?.id === id) {
      setSelectedContext({ ...selectedContext, ...updates });
    }
  };

  const removeContext = (id: string) => {
    setContexts((prev) => prev.filter((ctx) => ctx.id !== id));
    if (selectedContext?.id === id) {
      setSelectedContext(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(SELECTED_CONTEXT_ID_KEY);
      }
    }
  };

  const selectContext = (id: string | null) => {
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem(SELECTED_CONTEXT_ID_KEY, id);
      } else {
        localStorage.removeItem(SELECTED_CONTEXT_ID_KEY);
      }
    }
    if (!id) {
      setSelectedContext(null);
      return;
    }
    const context = contexts.find((ctx) => ctx.id === id);
    if (context) {
      setSelectedContext(context);
    }
  };

  const getContext = (id: string) => {
    return contexts.find((ctx) => ctx.id === id);
  };

  const formattedContext = `# Business Name
${selectedContext?.name}

## Description
${selectedContext?.content}`;

  return (
    <BusinessContext.Provider
      value={{
        formattedContext,
        contexts,
        selectedContext,
        addContext,
        updateContext,
        removeContext,
        selectContext,
        getContext,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error(
      "useBusinessContext must be used within a BusinessContextProvider"
    );
  }
  return context;
}
