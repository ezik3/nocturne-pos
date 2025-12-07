interface FistPoundIconProps {
  className?: string;
  filled?: boolean;
}

const FistPoundIcon = ({ className = "w-6 h-6", filled = false }: FistPoundIconProps) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"} 
      className={className}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Fist/Pound Icon */}
      <path d="M18 11c0-1.1-.9-2-2-2h-1V8c0-1.1-.9-2-2-2s-2 .9-2 2v1H9c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h7c1.1 0 2-.9 2-2v-7z" />
      <path d="M11 9V5c0-1.1-.9-2-2-2s-2 .9-2 2v9" />
      <path d="M13 9V4c0-1.1.9-2 2-2s2 .9 2 2v5" />
      {/* Impact lines */}
      {filled && (
        <>
          <line x1="4" y1="8" x2="2" y2="6" strokeWidth="2" />
          <line x1="4" y1="12" x2="1" y2="12" strokeWidth="2" />
          <line x1="4" y1="16" x2="2" y2="18" strokeWidth="2" />
        </>
      )}
    </svg>
  );
};

export default FistPoundIcon;
