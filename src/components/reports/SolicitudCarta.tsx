import { FullDetailedReport } from "../../types/reports";
import { AuthorityItem } from "../../types/authorities";
import { numberToLetters } from "../../helpers/numberToLetters";

// eslint-disable-next-line react-refresh/only-export-components
export { exportSolicitudCartaPDF } from "../../utils/pdfGenerators";

export function SolicitudCartaPreview({ data, authorities }: { data: FullDetailedReport, authorities: AuthorityItem[] }) {
  const { header, summary } = data;

  // Buscar autoridad (Administradora)
  const administradora = authorities.find(a =>
    a.ran_aut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("ADMINISTRAC") ||
    a.ran_aut.toLowerCase().includes("división de administración") ||
    a.nom_aut.toLowerCase().includes("deccy")
  );

  const today = new Date();
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const dateStr = `San Cristóbal, a los ${today.getDate()} días del mes de ${meses[today.getMonth()]} de ${today.getFullYear()}.`;

  const adminNombre = administradora ? `${administradora.nom_aut} ${administradora.ape_aut}`.toUpperCase() : `${header.nom_ctd} ${header.ape_ctd}`.toUpperCase();
  const adminCedula = administradora ? administradora.ced_aut : header.ced_ctd;
  const adminCargo = administradora ? (administradora.ran_aut.includes("DIVISIÓN") ? "ADMINISTRADORA" : administradora.ran_aut.toUpperCase()) : "ADMINISTRADORA";

  return (
    <div className="bg-white dark:bg-gray-950 w-full shadow-2xl border p-12 text-[16px] text-gray-900 dark:text-gray-100 font-serif min-h-[900px] rounded-sm transition-all duration-300 italic">
      {/* Logos */}
      <div className="flex justify-between items-start mb-6">
        <img src="/images/logos-reports/gobernacion.png" alt="Gobernación" className="h-14 w-auto object-contain" />
        <img src="/images/logos-reports/fundes.png" alt="FUNDES" className="h-20 w-auto object-contain" />
      </div>

      {/* Título */}
      <div className="text-center font-bold mb-8 uppercase">
        <p>SOLICITUD DE CONSTANCIA</p>
        <p>DE NOTIFICACION DE RENDICION DE CUENTA</p>
      </div>

      {/* Cuerpo del reporte */}
      <div className="text-justify leading-[1.5] space-y-1 px-4">
        <p className="indent-12">
          Yo, <span className="font-bold">{adminNombre}</span>, V-<span className="font-bold">{adminCedula}</span>,
          en mi condición de <span className="font-bold underline">{adminCargo}</span>, del organismo Fundación para el Desarrollo Social del Estado Táchira (FUNDES-TÁCHIRA),
          con sede ubicada en el <span className="font-bold underline uppercase">{header.dir_org || "CENTRO CÍVICO PISO 7, TORRE A"}</span>,
          TELEFONO: <span className="font-bold underline">{header.tel_org || "0276-3421745"}</span>, por medio de la presente, solicito Constancia de Notificación de la
          <span className="font-bold"> Rendición de Cuenta Nº {header.num_rnd}</span>.
        </p>

        <p className="indent-12">
          Dicha rendición corresponde a la cantidad de
          <span className="font-bold uppercase"> {numberToLetters(summary.montoRendido)} (Bs.{summary.montoRendidoFmt})</span>,
          la cual corresponde a la <span className="font-bold underline">Orden de Pago Nº {header.num_opg}</span> por concepto de:
          <span className="font-bold uppercase"> {(header.con_opg || "").toUpperCase()}</span>,
          APROBADO SEGÚN DECRETO Nº <span className="font-bold">{header.dcr_opg}</span> DE FECHA <span className="font-bold">{header.fdc_opg}</span>,
          ASIGNACIÓN PRESUPUESTARIA <span className="font-bold">{header.num_par || "13.05.51.4.07.03.03.02.003.002-000"}</span> RECIBIDA POR LA CANTIDAD
          <span className="font-bold uppercase"> {numberToLetters(summary.montoAsignado)} (Bs.{summary.montoAsignadoFmt})</span>.
        </p>

        <p className="indent-12">
          Se deja constancia que con esta rendición se alcanza el <span className="font-bold">{summary.porcentajeRendido}%</span> de la totalidad de la orden de pago,
          quedando pendiente el <span className="font-bold">{summary.porcentajePorRendir}%</span> por la cantidad de
          <span className="font-bold uppercase"> {numberToLetters(summary.montoPorRendir)} (Bs. {summary.montoPorRendirFmt})</span>.
        </p>

        <p className="indent-12 pt-3">{dateStr}</p>
      </div>

      <div className="text-center font-bolditalic italic mt-10 text-[12px]">
        “Los Queremos de Vuelta”
      </div>


      {/* Firma */}
      <div className="mt-24 text-center flex flex-col items-center">
        <div className="border-t-2 border-gray-900 pt-3 min-w-[350px]">
          <p className="font-bold uppercase">
            {administradora?.abr_ran || "LCDA."} {adminNombre}
          </p>
          <p className="font-bold text-[13px] uppercase">
            {administradora ? administradora.ran_aut : "JEFE DE LA DIVISIÓN DE ADMINISTRACIÓN"}
          </p>
          <p className="mt-1 text-[9px] italic uppercase leading-tight max-w-[360px] mx-auto">
            {administradora?.dec_aut || "SIN DECRETO"}
          </p>
        </div>
      </div>

      {/* FOOTER (PIE DE PÁGINA) */}
      <div className="flex justify-between items-center mt-12 border-t pt-4">
        {/* Logo Izquierdo */}
        <div className="w-1/4">
          <img src="/images/logos-reports/amemosTachira.png" alt="Amemos al Táchira" className="h-12 w-auto object-contain " />
        </div>

        {/* Texto Central */}
        <div className="w-2/4 text-center text-[10px] leading-tight text-gray-600 dark:text-gray-400 font-sans not-italic">
          <p className="font-bold">FUNDES - TACHIRA RIF: G-20000513-0</p>
          <p>Dirección: 7ma Avenida con Calle 7, Centro Cívico, Torre "A", Piso 7.</p>
          <p>San Cristóbal, Estado Táchira</p>
          <p>Teléfonos: 0276-3422355 // fundestachira2025@gmail.com</p>
        </div>

        {/* Logo Derecho */}
        <div className="w-1/4 flex justify-end">
          <img src="/images/logos-reports/logoFreddy.png" alt="Freddy Bernal" className="h-16 w-auto object-contain" />
        </div>
      </div>
    </div>
  );
}





