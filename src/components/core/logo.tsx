import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
  /** Mostra a linha "Hospital · Santa Casa da Bahia" abaixo do nome. */
  withCargo?: boolean;
}

/** Assinatura tipográfica do hospital: nome em display + ponto limão. Tamanho via font-size do pai. */
export function LogoHSI({ className, withCargo = false }: LogoProps) {
  return (
    <span className={cn("inline-flex select-none flex-col leading-none", className)}>
      <span className="display whitespace-nowrap text-[1.05em] font-semibold tracking-[-0.03em] text-text">
        Santa Izabel<span className="text-amber">.</span>
      </span>
      {withCargo && (
        <span className="mt-1.5 font-mono text-[0.42em] uppercase tracking-[0.2em] text-text-3">Hospital · Santa Casa da Bahia</span>
      )}
    </span>
  );
}
