import { FullDetailedReport } from "../../types/reports";
import { AuthorityItem } from "../../types/authorities";

export function DetailedReportPreview({ data, authorities }: { data: FullDetailedReport, authorities: AuthorityItem[] }) {
  const { header, details, summary } = data;
  const presidenta = authorities.find(a => a.ran_aut.toLowerCase().includes("presidenta"));
  const jefaAdmin = authorities.find(a =>
    a.ran_aut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("administrac") &&
    !a.ran_aut.toLowerCase().includes("presidenta")
  );

  const formatDate = (value: Date | string | number | null | undefined) => {
    if (!value || value === "N/A") return "N/A";
    if (value instanceof Date) return value.toLocaleDateString("es-VE").replace(/-/g, "/");
    return String(value).split("T")[0].replace(/-/g, "/");
  };

  const Header = () => (
    <div className="relative mb-5 min-h-[82px]">
      <img
        src="/images/logos-reports/fundesB.png"
        alt="FUNDES"
        className="absolute left-0 top-0 h-[72px] w-auto object-contain"
      />

      <div className="pt-1 text-center font-bold text-[12px] leading-tight">
        <p>GOBERNACIÓN DEL ESTADO TÁCHIRA</p>
        <p>DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS</p>
        <p>DEPARTAMENTO DE RECEPCIÓN</p>
        <p>DE RENDICIÓN DE CUENTAS</p>
      </div>

      <img
        src="/images/logos-reports/gobernacion.png"
        alt="Gobernación"
        className="absolute right-0 top-1 h-[48px] w-auto object-contain"
      />
    </div>
  );

  const Footer = () => (
    <div className="mt-8 flex items-center justify-between border-t pt-3">
      <div className="w-1/4">
        <img src="/images/logos-reports/amemosTachira.png" alt="Amemos al Táchira" className="h-12 w-auto object-contain" />
      </div>

      <div className="w-2/4 text-center text-[10px] leading-tight text-gray-600 dark:text-gray-400">
        <p className="font-bold">FUNDES - TÁCHIRA RIF: G-20000513-0</p>
        <p>Dirección: 7ma Avenida con Calle 7, Centro Cívico, Torre "A", Piso 7.</p>
        <p>San Cristóbal, Estado Táchira</p>
        <p>Teléfonos: 0276-3422355 // fundestachira2025@gmail.com</p>
      </div>

      <div className="w-1/4 flex justify-end">
        <img src="/images/logos-reports/logoFreddy.png" alt="Freddy Bernal" className="h-16 w-auto object-contain" />
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 w-full p-8 text-black dark:text-white font-sans border shadow-sm rounded-lg overflow-x-auto">
      <Header />

      <div className="flex justify-end mb-4">
        <p className="text-[12px] font-bold">RENDICIÓN DE CUENTA Nº {header.num_rnd}</p>
      </div>

      {/* Tabla 1: Datos Generales */}
      <div className="mb-2">
        <table className="w-full border-collapse border border-gray-300 text-[7px]">
          <tbody>
            <tr className="bg-[#f0f3fa] dark:bg-gray-800 font-bold">
              <td className="border border-gray-300 p-1 text-center">FECHA</td>
              <td className="border border-gray-300 p-1 text-center">NÚMERO DE ORDEN</td>
              <td className="border border-gray-300 p-1 text-center">FECHA DE ORDEN DE PAGO</td>
              <td className="border border-gray-300 p-1 text-center">DECRETO</td>
              <td className="border border-gray-300 p-1 text-center">FECHA DECRETO</td>
              <td className="border border-gray-300 p-1 text-center">FECHA DE COBRO OPG</td>
            </tr>
            <tr className="text-center font-medium">
              <td className="border border-gray-300 p-1">{new Date().toLocaleDateString("es-VE")}</td>
              <td className="border border-gray-300 p-1">{header.num_opg}</td>
              <td className="border border-gray-300 p-1">{formatDate(header.fec_opg)}</td>
              <td className="border border-gray-300 p-1">{header.dcr_opg || "N/A"}</td>
              <td className="border border-gray-300 p-1">{formatDate(header.fdc_opg || header.fco_opg)}</td>
              <td className="border border-gray-300 p-1">{formatDate(header.fco_opg)}</td>
            </tr>
            <tr className="bg-[#f0f3fa] dark:bg-gray-800 font-bold">
              <td className="border border-gray-300 p-1 text-center" colSpan={2}>ASIGNACIÓN PRESUPUESTARIA</td>
              <td className="border border-gray-300 p-1 text-center" colSpan={2}>PERIODO DE RENDICIÓN</td>
              <td className="border border-gray-300 p-1 text-center" colSpan={2}>% RENDIDO</td>
            </tr>
            <tr className="text-center">
              <td className="border border-gray-300 p-1" colSpan={2}>
                {header.num_par || header.arn_rnd || details[0]?.items[0]?.partida || "PARTIDA PENDIENTE"}
              </td>
              <td className="border border-gray-300 p-1 uppercase" colSpan={2}>{(header.prd_rnd || "").toUpperCase()}</td>
              <td className="border border-gray-300 p-1 font-bold" colSpan={2}>{summary.porcentajeRendido}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabla 2: Resumen de Montos */}
      <div className="mb-2">
        <table className="w-full border-collapse border border-gray-300 text-[7px]">
          <thead>
            <tr className="bg-[#f0f3fa] dark:bg-gray-800 text-black dark:text-white font-bold">
              <th className="border border-gray-300 p-1">MONTO ASIGNADO</th>
              <th className="border border-gray-300 p-1">RENDIDO ANTERIOR</th>
              <th className="border border-gray-300 p-1">MONTO RENDIDO</th>
              <th className="border border-gray-300 p-1">REINTEGRO</th>
              <th className="border border-gray-300 p-1">POR RENDIR</th>
              <th className="border border-gray-300 p-1">% POR RENDIR</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center font-medium">
              <td className="border border-gray-300 p-1">{summary.montoAsignadoFmt}</td>
              <td className="border border-gray-300 p-1">{summary.montoRendidoAnteriorFmt}</td>
              <td className="border border-gray-300 p-1 font-bold">{summary.montoRendidoFmt}</td>
              <td className="border border-gray-300 p-1">{summary.reintegroFmt || "0,00"}</td>
              <td className="border border-gray-300 p-1 font-bold">{summary.montoPorRendirFmt}</td>
              <td className="border border-gray-300 p-1">{summary.porcentajePorRendir || 0}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabla 3: Organismo y Cuentadante */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-gray-300 text-[7px]">
          <tbody>
            <tr className="bg-[#f0f3fa] dark:bg-gray-800 font-bold uppercase">
              <td className="border border-gray-300 p-1" colSpan={3}>DIRECCIÓN DEL ORGANISMO</td>
              <td className="border border-gray-300 p-1">TELÉFONO</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1" colSpan={3}>{header.dir_org || "7ma Avenida Centro Cívico Torre 'A' Piso 7 San Cristóbal"}</td>
              <td className="border border-gray-300 p-1">{header.tel_org || "(0276) 3422355"}</td>
            </tr>
            <tr className="bg-[#f0f3fa] dark:bg-gray-800 font-bold uppercase">
              <td className="border border-gray-300 p-1">APELLIDOS Y NOMBRES DEL CUENTADANTE</td>
              <td className="border border-gray-300 p-1">CÉDULA</td>
              <td className="border border-gray-300 p-1" colSpan={2}>TELÉFONO</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1 uppercase">{header.nom_ctd} {header.ape_ctd}</td>
              <td className="border border-gray-300 p-1">{header.ced_ctd}</td>
              <td className="border border-gray-300 p-1" colSpan={2}>{"(0276) 3422355"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detalles por Programa */}
      {details.map((grupo, idx) => (
        <div key={idx} className="mb-6">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-[#e1ebf5] dark:bg-blue-900/40 text-black dark:text-white font-bold text-[8px]">
                <th colSpan={9} className="border border-gray-300 p-1.5 text-center uppercase tracking-wide">
                  {grupo.nom_pro}
                </th>
              </tr>
              <tr className="bg-[#f0f3fa] dark:bg-gray-800 text-black dark:text-white font-bold text-[6.5px]">
                <th className="border border-gray-300 p-1 text-center">ND / OP</th>
                <th className="border border-gray-300 p-1 text-center">FECHA</th>
                <th className="border border-gray-300 p-1 text-center">PARTIDA</th>
                <th className="border border-gray-300 p-1 text-center">CHEQUE / TRANSF.</th>
                <th className="border border-gray-300 p-1 text-left">BENEFICIARIO / EMPRESA</th>
                <th className="border border-gray-300 p-1 text-center">RIF / CI</th>
                <th className="border border-gray-300 p-1 text-left">DIRECCIÓN</th>
                <th className="border border-gray-300 p-1 text-left">CONCEPTO</th>
                <th className="border border-gray-300 p-1 text-right">MONTO</th>
              </tr>
            </thead>
            <tbody className="text-[6px]">
              {(grupo.items || []).map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="border border-gray-300 p-1 text-center">{item.num_ndb}</td>
                  <td className="border border-gray-300 p-1 text-center whitespace-nowrap">{formatDate(item.fec_ndb)}</td>
                  <td className="border border-gray-300 p-1 text-center">{item.partida}</td>
                  <td className="border border-gray-300 p-1 text-center">{item.ref_ndb}</td>
                  <td className="border border-gray-300 p-1 uppercase">{item.nom_ben}</td>
                  <td className="border border-gray-300 p-1 text-center">{item.rif_ben}</td>
                  <td className="border border-gray-300 p-1 uppercase">{item.dir_ben || "-"}</td>
                  <td className="border border-gray-300 p-1 text-[5.5px] italic">{item.des_drn}</td>
                  <td className="border border-gray-300 p-1 text-right font-bold">{Number(item.mon_drn).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
              <tr className="bg-white font-bold text-[7px]">
                <td className="border border-gray-300 p-1.5 text-right uppercase" colSpan={8}>{grupo.nom_pro} SUBTOTAL:</td>
                <td className="border border-gray-300 p-1.5 text-right">{Number(grupo.subtotal).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      {/* TOTAL GENERAL */}
      <div className="mb-10">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="bg-white font-bold text-[8px]">
              <td className="border border-gray-300 p-2 text-right uppercase" colSpan={8}>TOTAL GENERAL:</td>
              <td className="border border-gray-300 p-2 text-right w-[18%]">{summary.montoRendidoFmt}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Firmas */}
      <div className="grid grid-cols-2 gap-12 mt-12 text-center text-black dark:text-white">
        <div className="border-t-2 border-black dark:border-white pt-2 flex flex-col items-center">
          <p className="font-bold uppercase text-[9px]">{presidenta ? `${presidenta.abr_ran || "Lcda."} ${presidenta.nom_aut} ${presidenta.ape_aut}`.trim() : "PENDIENTE"}</p>
          <p className="text-[8px] font-bold">C.I. {presidenta?.ced_aut}</p>
          <p className="text-[8px] font-bold">{presidenta?.ran_aut || "PRESIDENTA"}</p>
          {presidenta?.dec_aut && <p className="text-[6.5px] italic max-w-[200px] mt-1 leading-tight">{presidenta.dec_aut}</p>}
        </div>
        <div className="border-t-2 border-black dark:border-white pt-2 flex flex-col items-center">
          <p className="font-bold uppercase text-[9px]">{jefaAdmin ? `${jefaAdmin.abr_ran || "Lcda."} ${jefaAdmin.nom_aut} ${jefaAdmin.ape_aut}`.trim() : "PENDIENTE"}</p>
          <p className="text-[8px] font-bold">C.I. {jefaAdmin?.ced_aut}</p>
          <p className="text-[8px] font-bold">{jefaAdmin?.ran_aut || "ADMINISTRACIÓN"}</p>
          {jefaAdmin?.dec_aut && <p className="text-[6.5px] italic max-w-[200px] mt-1 leading-tight">{jefaAdmin.dec_aut}</p>}
        </div>
      </div>

      <Footer />
    </div>
  );
}