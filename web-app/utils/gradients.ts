// IPL-themed gradient backgrounds and styles for each year

// All IPL years from inception
export const IPL_YEARS = [
  2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025
];

// Get complete CSS classes for UI elements based on year (Tailwind-safe)
export const getYearStyles = (year: number) => {
  // Create cycling themes for all years
  const themes = [
    // Theme 1: Royal purple to gold
    {
      headerBg: 'bg-purple-600',
      headerBgHover: 'hover:bg-purple-700',
      primaryBg: 'bg-purple-600',
      primaryBgHover: 'hover:bg-purple-700',
      secondaryBg: 'bg-amber-500',
      secondaryBgHover: 'hover:bg-amber-600',
      spinnerBorder: 'border-purple-600',
      gradient: 'from-purple-600 via-purple-400 to-amber-400'
    },
    // Theme 2: Classic IPL orange to red
    {
      headerBg: 'bg-red-600',
      headerBgHover: 'hover:bg-red-700',
      primaryBg: 'bg-red-600',
      primaryBgHover: 'hover:bg-red-700',
      secondaryBg: 'bg-orange-500',
      secondaryBgHover: 'hover:bg-orange-600',
      spinnerBorder: 'border-red-600',
      gradient: 'from-orange-500 via-red-400 to-red-600'
    },
    // Theme 3: Electric blue to cyan
    {
      headerBg: 'bg-blue-600',
      headerBgHover: 'hover:bg-blue-700',
      primaryBg: 'bg-blue-600',
      primaryBgHover: 'hover:bg-blue-700',
      secondaryBg: 'bg-cyan-500',
      secondaryBgHover: 'hover:bg-cyan-600',
      spinnerBorder: 'border-blue-600',
      gradient: 'from-blue-600 via-blue-400 to-cyan-400'
    },
    // Theme 4: Emerald green to lime
    {
      headerBg: 'bg-green-600',
      headerBgHover: 'hover:bg-green-700',
      primaryBg: 'bg-green-600',
      primaryBgHover: 'hover:bg-green-700',
      secondaryBg: 'bg-lime-500',
      secondaryBgHover: 'hover:bg-lime-600',
      spinnerBorder: 'border-green-600',
      gradient: 'from-emerald-500 via-green-400 to-lime-400'
    },
    // Theme 5: Magenta to pink
    {
      headerBg: 'bg-pink-600',
      headerBgHover: 'hover:bg-pink-700',
      primaryBg: 'bg-pink-600',
      primaryBgHover: 'hover:bg-pink-700',
      secondaryBg: 'bg-rose-500',
      secondaryBgHover: 'hover:bg-rose-600',
      spinnerBorder: 'border-pink-600',
      gradient: 'from-pink-600 via-pink-400 to-rose-400'
    },
    // Theme 6: Indigo to violet
    {
      headerBg: 'bg-indigo-600',
      headerBgHover: 'hover:bg-indigo-700',
      primaryBg: 'bg-indigo-600',
      primaryBgHover: 'hover:bg-indigo-700',
      secondaryBg: 'bg-violet-500',
      secondaryBgHover: 'hover:bg-violet-600',
      spinnerBorder: 'border-indigo-600',
      gradient: 'from-indigo-600 via-indigo-400 to-violet-400'
    }
  ];
  
  // Map specific years to themes
  switch (year) {
    case 2025: return themes[3]; // Current season - green
    case 2024: return themes[2]; // Blue
    case 2023: return themes[1]; // Orange-red
    case 2022: return themes[0]; // Purple-gold
    case 2021: return themes[4]; // Pink
    case 2020: return themes[5]; // Indigo
    case 2019: return themes[3]; // Green
    case 2018: return themes[2]; // Blue
    case 2017: return themes[1]; // Orange-red
    case 2016: return themes[0]; // Purple-gold
    case 2015: return themes[4]; // Pink
    case 2014: return themes[5]; // Indigo
    case 2013: return themes[3]; // Green
    case 2012: return themes[2]; // Blue
    case 2011: return themes[1]; // Orange-red
    case 2010: return themes[0]; // Purple-gold
    case 2009: return themes[4]; // Pink
    case 2008: return themes[1]; // Orange-red (inaugural season)
    
    default:
      // Default gradient for any other year
      return {
        headerBg: 'bg-blue-600',
        headerBgHover: 'hover:bg-blue-700',
        primaryBg: 'bg-blue-600',
        primaryBgHover: 'hover:bg-blue-700',
        secondaryBg: 'bg-orange-500',
        secondaryBgHover: 'hover:bg-orange-600',
        spinnerBorder: 'border-blue-600',
        gradient: 'from-blue-50 to-orange-50'
      };
  }
};

// IPL-themed gradient backgrounds for each year
export const getYearGradient = (year: number): string => {
  return getYearStyles(year).gradient;
};

// Legacy function for backward compatibility
export const getYearColors = (year: number) => {
  const styles = getYearStyles(year);
  return {
    primary: styles.primaryBg.replace('bg-', ''),
    secondary: styles.secondaryBg.replace('bg-', ''),
    accent: 'blue-100',
    text: 'blue-800'
  };
};