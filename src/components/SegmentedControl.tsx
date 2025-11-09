/**
 * SegmentedControl Component
 * Phase 6: Advanced QoL & Teacher Power-User Tools
 * 
 * A reusable segmented control (button group) component used for filtering.
 * Matches the elegant design system used in ShopPage.
 */

interface SegmentedOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (newValue: string) => void;
}

export const SegmentedControl = ({ 
  options, 
  value, 
  onChange
}: SegmentedControlProps) => {
  return (
    <div className="inline-flex bg-[#223149] rounded-xl p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${value === option.value 
              ? 'bg-primary text-white shadow-md' 
              : 'text-text-secondary-dark hover:text-text-primary-dark bg-transparent'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
