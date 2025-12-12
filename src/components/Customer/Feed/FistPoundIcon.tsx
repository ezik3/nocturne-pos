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
      {/* Realistic Fist - Front facing punch */}
      {/* Knuckles/top of fist */}
      <path d="M6 10c0-1 .5-2 1.5-2.5C8.5 7 9.5 6 10 5c.5-1 1-1.5 2-1.5s1.5.5 2 1.5c.5 1 1.5 2 2.5 2.5 1 .5 1.5 1.5 1.5 2.5" />
      
      {/* Main fist body */}
      <path d="M6 10v6c0 2 1 3 3 3h6c2 0 3-1 3-3v-6" />
      
      {/* Finger lines/creases */}
      <path d="M8.5 7v3" />
      <path d="M11 5.5v4" />
      <path d="M13.5 5.5v4" />
      <path d="M16 7.5v2.5" />
      
      {/* Thumb wrapped around */}
      <path d="M6 13c-1 0-2 .5-2 1.5s1 1.5 2 1.5" />
      
      {/* Knuckle detail lines */}
      <path d="M8 10.5h8" />
      
      {/* Impact lines when filled/active */}
      {filled && (
        <>
          <line x1="20" y1="8" x2="22" y2="6" strokeWidth="2" />
          <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" />
          <line x1="20" y1="16" x2="22" y2="18" strokeWidth="2" />
        </>
      )}
    </svg>
  );
};

export default FistPoundIcon;
