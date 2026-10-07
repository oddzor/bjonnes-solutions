interface LogoProps {
  /** Sets the size, and the wordmark's colour through the text colour. */
  className?: string;
  /** The colour of "Solutions" and its rules; the logo's own blue unless the ground calls for another. */
  accent?: string;
}

const N = "M348.3 18H376L421 72V18H443V105H417.3L371.5 50V105H348.3Z";
const SMALL_S =
  "M186.5 135.5C180 132.8 174 131.75 168 131.75C161 131.75 157.8 134.5 157.8 138.3C157.8 142.5 161 144.3 168 144.8L176 145.3C183.5 145.9 186.6 148 186.6 151.8C186.6 155.8 183 158.25 175 158.25C168 158.25 161.5 157 155.5 154";

/**
 * The Bjønnes Solutions wordmark, redrawn as vector from public/images/logo-removebg-preview.png.
 * The same drawing is in public/images/logo.svg, in the logo's own colours.
 */
export function Logo({ className, accent = "#436180" }: LogoProps) {
  return (
    <svg viewBox="48 14 712 152" aria-hidden className={className}>
      <g fill="currentColor">
        <path
          fillRule="evenodd"
          d="M52 18H112C132 18 141 27 141 40C141 50 137 56 130.5 60C140 63.5 146.3 71 146.3 81C146.3 97 135 105 113 105H52ZM75.5 36.8V53H105C112 53 117.3 50 117.3 45C117.3 39.5 112 36.8 104 36.8ZM75.5 69V87H107C116 87 122.3 84 122.3 78C122.3 72 116 69 107 69Z"
        />
        <path d="M187.7 18H211.7V72C211.7 95 198 105.5 178 105.5C167 105.5 157 103 150 99.5L157 83.5C163 86 169 87.5 175 87.5C183.5 87.5 187.7 83 187.7 73Z" />
        <path
          fillRule="evenodd"
          d="M281.2 17.4C313 17.4 336 36 336 62C336 88 313 106.4 281.2 106.4C249.4 106.4 226.4 88 226.4 62C226.4 36 249.4 17.4 281.2 17.4ZM281.2 36C263.5 36 250.8 47 250.8 62.5C250.8 78 263.5 89 281.2 89C298.9 89 311.5 78 311.5 62.5C311.5 47 298.9 36 281.2 36Z"
        />
        <path d="M315 18H337.5L247 105H224.5Z" />
        <path d={N} />
        <path d={N} transform="translate(114.2)" />
        <path d="M576 18H654V36H599V53H648.5V69H599V87H655V105H576Z" />
        <path d="M748.7 25.8L743.3 41.8C733 37.5 720 35.2 707 35.2C696 35.2 690 38.5 690 44C690 49.5 696 51.5 708 52.3C735 54.5 756 60 756 78C756 97 740 106 712 106C695 106 678 102.5 666.4 96.5L672.4 80.8C685 86 700 88.3 714 88.3C726 88.3 732.5 85.5 732.5 79.5C732.5 73.5 726 71 714 70C690 68.5 667 65 667 44.5C667 27 683 17 711 17C725 17 738 20.5 748.7 25.8Z" />
      </g>
      <g fill={accent}>
        <path d="M64 143.3L131.6 141.8V144.8ZM722.5 143.3L654.8 141.8V144.8Z" />
        <path d="M536 128H546L567.2 150V128H574.7V162H564.7L543.5 140V162H536Z" />
      </g>
      <g fill="none" stroke={accent} strokeWidth="7.5">
        <path d={SMALL_S} />
        <path d={SMALL_S} transform="translate(444.2)" />
        <rect x="211.5" y="131.75" width="34.3" height="26.5" rx="12" />
        <rect x="476.6" y="131.75" width="34.3" height="26.5" rx="12" />
        <path d="M276.5 128V158.25H305.7M328 128V146.5C328 154 333 158.25 342.6 158.25C352 158.25 357.2 154 357.2 146.5V128M382 131.75H418M400 131.75V162M445.6 128V162" />
      </g>
    </svg>
  );
}
