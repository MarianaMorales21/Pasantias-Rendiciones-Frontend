import { FullDetailedReport } from "../../types/reports";
import { AuthorityItem } from "../../types/authorities";

export { exportSolicitudFormaPDF } from "../../utils/pdfGenerators";

export function SolicitudFormaPreview({ data, authorities }: { data: FullDetailedReport, authorities: AuthorityItem[] }) {
  const { header, summary } = data;

  // Buscar autoridad (Administradora)
  const administradora = authorities.find(a =>
    a.ran_aut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("ADMINISTRAC") ||
    a.ran_aut.toLowerCase().includes("división de administración") ||
    a.nom_aut.toLowerCase().includes("deccy")
  );

  const today = new Date();
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  const abr = administradora?.abr_ran || "Lcda.";
  const adminNombreFull = administradora 
    ? `${abr} ${administradora.nom_aut.toUpperCase()} ${administradora.ape_aut.toUpperCase()}` 
    : `Lcda. ${header.nom_ctd.toUpperCase()} ${header.ape_ctd.toUpperCase()}`;
  const adminCedula = administradora ? administradora.ced_aut : header.ced_ctd;
  const adminCargo = administradora ? administradora.ran_aut : "Jefe de la División de Administración";

  return (
    <div className="bg-white dark:bg-gray-950 w-full shadow-2xl border-[3px] border-gray-900 p-0 text-[12px] text-gray-900 dark:text-gray-100 font-sans rounded-sm transition-all duration-300">
      {/* ENCABEZADO */}
      <div className="grid grid-cols-12 border-b-[2px] border-gray-900 min-h-[90px]">
        <div className="col-span-2 flex items-center justify-center p-2 border-r-[1.5px] border-gray-900">
          <img src="/images/logos-reports/fundes.png" alt="FUNDES" className="h-16 w-auto object-contain" />
        </div>
        <div className="col-span-4 flex flex-col justify-center items-center text-center p-2 border-r-[1.5px] border-gray-900 text-[8px] font-bold leading-tight">
          <p>GOBIERNO BOLIVARIANO DEL TÁCHIRA</p>
          <p>DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS</p>
          <p>DEPARTAMENTO RECEPCIÓN</p>
          <p>DE RENDICIÓN DE CUENTAS</p>
        </div>
        <div className="col-span-2 flex items-center justify-center p-2 border-r-[1.5px] border-gray-900">
          <img src="/images/logos-reports/gobernacion.png" alt="GOBERNACIÓN" className="h-10 w-auto object-contain" />
        </div>
        <div className="col-span-4 flex flex-col justify-center items-center p-2 text-center">
          <p className="font-bold text-[10px] leading-tight">SOLICITUD DE CONSTANCIA DE NOTIFICACIÓN DE RENDICIÓN DE CUENTA</p>
        </div>
      </div>

      {/* FILA 1: YO, NOMBRE, CEDULA */}
      <div className="p-4 space-y-4">
        <div className="flex items-end gap-2">
          <span className="italic shrink-0">Yo,</span>
          <div className="flex-grow border-b-2 border-gray-900 text-center font-bold text-[14px]">
            {adminNombreFull}
          </div>
          <span className="shrink-0 text-[11px]">Portador de la cédula de identidad Nº</span>
          <div className="w-32 border-b-2 border-gray-900 text-center font-bold text-[14px]">
            V-{adminCedula}
          </div>
        </div>

        {/* FILA 2: CONDICION, ORGANISMO */}
        <div className="flex items-end gap-2">
          <span className="italic shrink-0">en mi condición de</span>
          <div className="flex-grow border-b-2 border-gray-900 text-center font-bold">
            {adminCargo}
          </div>
          <span className="shrink-0">del Organismo</span>
        </div>

        {/* FILA 3: NOMBRE ORGANISMO, SEDE */}
        <div className="flex items-end gap-2">
          <div className="flex-grow border-b-2 border-gray-900 text-center font-bold uppercase">
            {header.nom_org || "FUNDACIÓN PARA EL DESARROLLO SOCIAL DEL ESTADO TÁCHIRA (FUNDES - TÁCHIRA)"}
          </div>
          <span className="shrink-0">con sede ubicada en:</span>
        </div>

        {/* FILA 4: DIRECCION, TELEFONO */}
        <div className="flex items-end gap-2">
          <div className="flex-grow border-b-2 border-gray-900 text-center font-bold text-[11px]">
            {header.dir_org || "7MA. AV. CENTRO CÍVICO TORRE 'A' PISO 7 SAN CRISTÓBAL"}
          </div>
          <span className="shrink-0">Teléfono:</span>
          <div className="w-40 border-b-2 border-gray-900 text-center font-bold">
            {header.tel_org || "(0276) - 342.17.45"}
          </div>
        </div>
      </div>

      <div className="border-t-[1.5px] border-gray-900 p-4 space-y-6">
        <p className="leading-relaxed">
          Por medio de la presente, anexo los requisitos exigidos, para solicitar Constancia de Notificación de
        </p>
        
        <div className="flex items-end gap-4">
          <span className="shrink-0">Rendición de Cuentas correspondiente a la Orden de Pago Nº</span>
          <div className="w-32 border-b-[3px] border-gray-900 text-center font-bold text-[18px]">
            {header.num_opg}
          </div>
          <span className="shrink-0">por un monto en bolívares</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="w-48 border-b-[3px] border-gray-900 text-center font-bold text-[18px]">
            {summary.montoRendidoFmt}
          </div>
          <span className="shrink-0">con fecha de cobro</span>
          <div className="w-40 border-b-[3px] border-gray-900 text-center font-bold">
            {header.fco_opg || "N/A"}
          </div>
          <div className="flex-grow text-[10px] leading-tight flex flex-col">
            <span>Partida Nº</span>
            <span className="font-bold border-b border-gray-400">{header.num_par || "13.05.51.4-07.01.03.02.003.002-000"}</span>
          </div>
          <span className="shrink-0 text-[11px] self-end">por concepto de:</span>
        </div>

        {/* BLOQUE CONCEPTO */}
        <div className="border-t-[1.5px] border-gray-900 pt-4 text-justify leading-tight uppercase font-bold italic min-h-[120px]">
          {header.con_opg}, APROBADO SEGÚN DECRETO {header.dcr_opg} DE FECHA {header.fdc_opg}.
        </div>

        {/* FECHA */}
        <div className="border-t-[1.5px] border-gray-900 pt-6 flex items-end gap-2 justify-center">
          <span>En San Cristóbal, a los</span>
          <div className="w-12 border-b-2 border-gray-900 text-center font-bold">{today.getDate()}</div>
          <span>días, del mes de</span>
          <div className="w-40 border-b-2 border-gray-900 text-center font-bold uppercase">{meses[today.getMonth()]}</div>
          <span>de</span>
          <div className="w-24 border-b-2 border-gray-900 text-center font-bold">{today.getFullYear()}</div>
        </div>

        {/* FIRMA */}
        <div className="mt-16 flex flex-col items-center">
          <div className="w-[450px] border-t-[3px] border-gray-900 pt-2 text-center font-bold uppercase text-[15px]">
            {adminNombreFull}
          </div>
        </div>
      </div>

      {/* NOTA PIE */}
      <div className="border-t-[2px] border-gray-900 p-3 text-[10px] italic leading-tight text-justify bg-gray-50 dark:bg-gray-900">
        <span className="font-bold not-italic">NOTA:</span> La constancia de verificación de Rendición de Cuentas, Solamente será entregada con la presentación de la Solicitud, en el Departamento de Recepción de Rendición de Cuentas, de la Gobernación del Estado Táchira, dentro de los siguientes ocho (08) días hábiles a su petición.
      </div>
    </div>
  );
}
