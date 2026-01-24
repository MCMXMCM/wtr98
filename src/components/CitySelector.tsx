import { Dispatch, SetStateAction, useState, useRef, useEffect, useLayoutEffect, memo } from "react";
import { cityOptions } from "../assets/majorCityPositions";
import { useQueryClient } from "@tanstack/react-query";
import { Position } from "../types/global";
import "./CustomSelect.css";

const PLACEHOLDER = "make a selection";
const cityOptionsList = [PLACEHOLDER, ...Object.keys(cityOptions)];

interface CitySelectorProps {
  currentLocation: boolean;
  setCurrentLocation: Dispatch<SetStateAction<boolean>>;
  setPosition: Dispatch<SetStateAction<Position>>;
  automaticMode: boolean;
  setAutomaticMode: Dispatch<SetStateAction<boolean>>;
}

const USER_HAS_SELECTED_KEY = "wtr98-user-has-selected";

function CitySelector({
  setPosition,
  setCurrentLocation,
  currentLocation,
  automaticMode,
  setAutomaticMode,
}: CitySelectorProps) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(PLACEHOLDER);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
  }>({ left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const highlightedOptionRef = useRef<HTMLButtonElement | null>(null);

  const handleOptionChange = (value: string) => {
    setSelected(value);
    setFilter("");
    setIsDropdownOpen(false);
    if (value === PLACEHOLDER) {
      setCurrentLocation(false);
      return;
    }
    setCurrentLocation(false);
    // Turn off automatic mode when user selects a city
    setAutomaticMode(false);
    localStorage.setItem("wtr98-automatic-mode", "false");
    localStorage.setItem(USER_HAS_SELECTED_KEY, "true");
    const { latitude, longitude } = cityOptions[value];
    localStorage.setItem("latitude", String(latitude));
    localStorage.setItem("longitude", String(longitude));
    queryClient.prefetchQuery({
      queryKey: ["weather", latitude, longitude],
    });
    setPosition({ latitude, longitude });
  };

  const filteredOptions = cityOptionsList.filter((opt) =>
    opt.toLowerCase().includes(filter.toLowerCase())
  );

  useLayoutEffect(() => {
    if (!isDropdownOpen || !triggerRef.current || !dropdownListRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const el = dropdownListRef.current;
    const gap = 2;
    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(el.offsetWidth, vw - 2 * pad);
    const spaceBelow = vh - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openAbove = spaceAbove > spaceBelow;
    const left = Math.max(pad, Math.min(rect.left, vw - width - pad));
    if (openAbove) {
      setDropdownPosition({
        bottom: vh - (rect.top - gap),
        left,
      });
    } else {
      setDropdownPosition({
        top: rect.bottom + gap,
        left,
      });
    }
  }, [isDropdownOpen, filter]);

  useEffect(() => {
    if (isDropdownOpen) {
      setFilter("");
      setHighlightedIndex(0);
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filter]);

  useEffect(() => {
    const list = dropdownListRef.current;
    const opt = highlightedOptionRef.current;
    if (!list || !opt) return;
    const listRect = list.getBoundingClientRect();
    const optRect = opt.getBoundingClientRect();
    if (optRect.top < listRect.top) {
      list.scrollTop += optRect.top - listRect.top;
    } else if (optRect.bottom > listRect.bottom) {
      list.scrollTop += optRect.bottom - listRect.bottom;
    }
  }, [highlightedIndex, filteredOptions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;
    const opts = filteredOptions;
    if (opts.length === 0) {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsDropdownOpen(false);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % opts.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + opts.length) % opts.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleOptionChange(opts[highlightedIndex]);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFilter("");
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleScroll = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setFilter("");
      setIsDropdownOpen(false);
    };
    document.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => document.removeEventListener("scroll", handleScroll, { capture: true });
  }, [isDropdownOpen]);

  const displayValue = currentLocation ? PLACEHOLDER : selected;

  return (
    <div>
      <label style={{ fontSize: "16px", textAlign: "start", width: "100%", padding: "0 4px" }} htmlFor="city-select">
        Select a city:
      </label>
      <div className="custom-select" ref={dropdownRef}>
        <div
          ref={triggerRef}
          className={`custom-select-trigger ${displayValue !== PLACEHOLDER ? "custom-select-trigger--has-value" : ""} ${automaticMode ? "custom-select-trigger--disabled" : ""}`}
          role="combobox"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          aria-disabled={automaticMode}
          onClick={() => {
            if (!isDropdownOpen && !automaticMode) {
              setIsDropdownOpen(true);
              inputRef.current?.focus({ preventScroll: true });
            }
          }}
        >
          <input
            ref={inputRef}
            id="city-select"
            type="text"
            className="custom-select-input"
            value={isDropdownOpen ? filter : displayValue}
            readOnly={!isDropdownOpen}
            onChange={(e) => isDropdownOpen && setFilter(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (!isDropdownOpen && !automaticMode) setIsDropdownOpen(true);
            }}
            disabled={automaticMode}
            style={{ fontSize: "16px" }}
            placeholder={isDropdownOpen ? "Type to search…" : undefined}
            autoComplete="off"
          />
          <span className="custom-select-arrow">▼</span>
        </div>
        {isDropdownOpen && (
          <div
            ref={dropdownListRef}
            className="custom-select-dropdown"
            role="listbox"
            style={{
              ...(dropdownPosition.top != null && { top: `${dropdownPosition.top}px` }),
              ...(dropdownPosition.bottom != null && { bottom: `${dropdownPosition.bottom}px` }),
              left: `${dropdownPosition.left}px`,
            }}
          >
            {filteredOptions.length === 0 ? (
              <div className="custom-select-no-matches">No matches</div>
            ) : (
              filteredOptions.map((opt, i) => (
                <button
                  key={opt}
                  ref={i === highlightedIndex ? highlightedOptionRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={displayValue === opt || i === highlightedIndex}
                  className={`custom-select-option ${i === highlightedIndex ? "highlighted" : ""}`}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onClick={() => handleOptionChange(opt)}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CitySelector);
