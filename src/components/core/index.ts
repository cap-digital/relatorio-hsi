// Barrel for the foundation components. Pages may import from "@/components/core" or from each file.
export { SmoothScroll } from "./smooth-scroll";
export { Preloader, useHubReady } from "./preloader";
export { markHubReady, waitForHubReady, getHubReady } from "./hub-ready-store";
export { Grain } from "./grain";
export { PageTransition, playCurtainIn, playCurtainOut } from "./page-transition";
export { TransitionLink } from "./transition-link";
export { Section, type SectionProps, type SectionTone } from "./section";
export { SplitHeading, type SplitHeadingProps } from "./split-heading";
export { Reveal, type RevealProps } from "./reveal";
export { InView, type InViewProps } from "./in-view";
export { Counter, type CounterProps } from "./counter";
export { KpiTile, type KpiTileProps, type KpiTone, type KpiSize } from "./kpi-tile";
export { ChartFrame, type ChartFrameProps, type ChartTone } from "./chart-frame";
export { Magnetic, type MagneticProps } from "./magnetic";
export { Cta, type CtaProps, type CtaVariant } from "./cta";
export { Sparkline, type SparklineProps } from "./sparkline";
export { LogoHSI, type LogoProps } from "./logo";
export { formatCounterValue, formatDelta, countFractionDigits, type CounterFormat } from "./format-number";
