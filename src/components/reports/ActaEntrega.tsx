import { FullDetailedReport } from "../../types/reports";
import { AuthorityItem } from "../../types/authorities";
import { numberToLetters } from "../../helpers/numberToLetters";

export function ActaPreview({ data, authorities }: { data: FullDetailedReport, authorities: AuthorityItem[] }) {
  const { header, summary } = data;

  // Buscar autoridades específicas (Búsqueda más amplia para Administración)
  const presidenta = authorities.find(a => a.ran_aut.toLowerCase().includes("presidenta"));
  const administradora = authorities.find(a =>
    a.ran_aut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("administrac") ||
    a.ran_aut.toLowerCase().includes("división de administración") ||
    a.nom_aut.toLowerCase().includes("deccy")
  );
  const jefeGobernacion = authorities.find(a =>
    a.ran_aut.toLowerCase().includes("gobernación") ||
    a.ran_aut.toLowerCase().includes("finanzas") ||
    a.ran_aut.toLowerCase().includes("director")
  );

  const today = new Date();
  const dateStr = `San Cristóbal, ${today.getDate()} de ${today.toLocaleString("es-ES", { month: "long" })} de ${today.getFullYear()}`;

  const formatName = (auth?: AuthorityItem, fallback: string = "") => {
    if (!auth) return fallback;
    const abr = auth.abr_ran || "Lcda.";
    const name = `${auth.nom_aut} ${auth.ape_aut}`.toUpperCase();
    return `${abr} ${name.replace("LCDA. ", "").replace("LCDA ", "")}`;
  };

  return (
    <div className="bg-white dark:bg-gray-950 w-full shadow-2xl border p-12 text-[12px] text-gray-900 dark:text-gray-100 font-serif min-h-[900px] rounded-sm transition-all duration-300">
      {/* Logos en la parte superior */}
      <div className="flex justify-between items-start mb-6">
        <img src="/images/logos-reports/gobernacion.png" alt="Gobernación" className="h-14 w-auto object-contain" />
        <img src="/images/logos-reports/fundes.png" alt="FUNDES" className="h-20 w-auto object-contain" />
      </div>

      <div className="text-right mb-4 font-normal italic">{dateStr}</div>

      <div className="mb-4 space-y-0 italic">
        <p>Ciudadana</p>
        <p className="font-bolditalic uppercase">
          {formatName(jefeGobernacion, "LCDA. MILAGROS DEL VALLE RAMOS GARCÍA")}
        </p>
        <p className="font-bolditalic uppercase">
          {jefeGobernacion ? jefeGobernacion.ran_aut : "DIRECTORA DE ADMINISTRACIÓN Y FINANZAS"}
        </p>
        <p className="font-bolditalic uppercase">GOBERNACIÓN DEL ESTADO TÁCHIRA</p>
        <p>Su Despacho</p>
      </div>

      <div className="mb-4 flex justify-end italic">
        <div className="text-right">
          <span className="font-bolditalic">Atención:</span> Departamento Rendición de Cuentas
        </div>
      </div>

      <div className="text-justify leading-[1.35] space-y-3 italic">
        <p>
          Reciba un saludo cordial y revolucionario, en nombre de la Fundación para el Desarrollo Social del Estado Táchira “FUNDES – TÁCHIRA”,
          con espíritu de colaboración, unidad y fortaleciendo los lazos que nos unen en la búsqueda de objetivos comunes y deseándole el mayor de los éxitos en las funciones que desempeñan.
        </p>

        <p>
          Por medio de la presente, se hace entrega formal de la Rendición de Cuenta Nº
          <span className="font-bolditalic mx-1">{header.num_rnd}</span>, por la cantidad de
          <span className="font-bolditalic uppercase mx-1"> {numberToLetters(summary.montoRendido)} (Bs. {summary.montoRendidoFmt})</span>.
        </p>

        <p>
          Dicha rendición corresponde a la Orden de Pago Nº
          <span className="font-bolditalic mx-1">{header.num_opg}</span> por concepto de:
          <span className="uppercase font-bolditalic mx-1"> {(header.con_opg || "").toUpperCase()}</span>,
          APROBADO SEGÚN DECRETO Nº <span className="font-bolditalic">{header.dcr_opg}</span> DE FECHA <span className="font-bolditalic">{header.fdc_opg}</span>,
          ASIGNACIÓN PRESUPUESTARIA <span className="font-bolditalic">{header.num_par || ""}</span>, RECIBIDA POR LA CANTIDAD
          <span className="font-bolditalic uppercase mx-1"> {numberToLetters(summary.montoAsignado)} (Bs. {summary.montoAsignadoFmt})</span>.
        </p>

        <p>
          Se deja constancia que con esta rendición se alcanza el <span className="font-bolditalic">{summary.porcentajeRendido}%</span> de la totalidad de la orden de pago
          quedando pendiente el <span className="font-bolditalic">{summary.porcentajePorRendir}%</span> por la cantidad de
          <span className="font-bolditalic uppercase"> {numberToLetters(summary.montoPorRendir)} (Bs. {summary.montoPorRendirFmt})</span>.
        </p>

        <div className="space-y-0.5">
          <p>Sin otro particular a que hacer referencia, nos suscribimos de usted.</p>
          <p>Atentamente,</p>
        </div>
      </div>

      <div className="text-center font-bolditalic italic mt-10 text-[12px]">
        “Los Queremos de Vuelta”
      </div>

      {/* Firmas */}
      <div className="grid grid-cols-2 gap-16 mt-16 text-center">
        <div className="border-t border-gray-900 pt-2 flex flex-col items-center">
          <p className="font-bolditalic uppercase text-[10.5px]">
            {formatName(presidenta, "LCDA. YARITZA ISBEL PEÑA DUARTE")}
          </p>
          <p className="font-bolditalic text-[9.5px] uppercase">
            {presidenta?.ran_aut || "Presidenta"}
          </p>
          <p className="text-[7.5px] max-w-[220px] leading-tight mt-1 opacity-90 uppercase italic">
            {presidenta?.dec_aut}
          </p>
        </div>

        <div className="border-t border-gray-900 pt-2 flex flex-col items-center">
          <p className="font-bolditalic uppercase text-[10.5px]">
            {formatName(administradora, "LCDA. DECCY C. PERNIA LEAL")}
          </p>
          <p className="font-bolditalic text-[9.5px] uppercase">
            {administradora?.ran_aut || "Jefe División de Administración"}
          </p>
          <p className="text-[7.5px] max-w-[220px] leading-tight mt-1 opacity-90 uppercase italic">
            {administradora?.dec_aut}
          </p>
        </div>
      </div>
    </div>
  );
}