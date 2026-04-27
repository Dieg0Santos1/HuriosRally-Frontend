import jsPDF from "jspdf";

interface SaleItem {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface BoletaData {
    boletaNumber: string;
    date: string;
    clientName: string;
    clientDNI: string;
    items: SaleItem[];
    subtotal: number;
    igv: number;
    total: number;
    paymentMethod: string;
    deliveryMethod: string;
}

interface FacturaData {
    facturaNumber: string;
    date: string;
    clientName: string;
    clientRUC: string;
    clientAddress: string;
    items: SaleItem[];
    subtotal: number;
    anticipos: number;
    descuentos: number;
    valorVenta: number;
    isc: number;
    igv: number;
    total: number;
    paymentMethod: string;
    deliveryMethod: string;
}

// Función auxiliar para convertir imagen a base64
async function getLogoBase64(): Promise<string | null> {
    try {
        const response = await fetch('/assets/imgs/logo.webp');
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error('Error cargando logo:', e);
        return null;
    }
}

// Función para convertir número a texto en español
function numeroALetras(num: number): string {
    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
    
    if (num === 0) return 'CERO';
    if (num === 100) return 'CIEN';
    
    let resultado = '';
    const entero = Math.floor(num);
    const decimales = Math.round((num - entero) * 100);
    
    // Centenas
    const c = Math.floor(entero / 100);
    if (c > 0) resultado += centenas[c] + ' ';
    
    // Decenas y unidades
    const du = entero % 100;
    if (du >= 10 && du < 20) {
        resultado += especiales[du - 10];
    } else {
        const d = Math.floor(du / 10);
        const u = du % 10;
        if (d > 0) resultado += decenas[d] + (u > 0 ? ' Y ' : '');
        if (u > 0) resultado += unidades[u];
    }
    
    return resultado.trim() + ' CON ' + decimales.toString().padStart(2, '0') + '/100 SOLES';
}

export async function generateBoletaPDF(data: BoletaData) {
    const doc = new jsPDF();
    
    // Borde exterior del documento
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);
    
    // Agregar logo
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
        try {
            doc.addImage(logoBase64, 'WEBP', 15, 15, 25, 25);
        } catch (e) {
            console.error('Error agregando logo:', e);
        }
    }
    
    // Encabezado principal
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("HURIOS RALLY E.I.R.L.", 105, 25, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Av. 22 de Agosto 1012, Comas 15312", 105, 31, { align: "center" });
    doc.text("Telf: 978 451 154", 105, 36, { align: "center" });
    
    // Cuadro RUC y Boleta (más grande y destacado)
    doc.setLineWidth(1.5);
    doc.rect(145, 15, 50, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("RUC: 20492248933", 170, 22, { align: "center" });
    doc.setFontSize(9);
    doc.text("BOLETA DE VENTA", 170, 28, { align: "center" });
    doc.text("ELECTRÓNICA", 170, 33, { align: "center" });
    doc.setFontSize(11);
    doc.text(`N° ${data.boletaNumber}`, 170, 41, { align: "center" });
    
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(15, 50, 195, 50);
    
    // Información del cliente
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL CLIENTE:", 15, 58);
    
    doc.setFont("helvetica", "normal");
    doc.text("Cliente:", 15, 65);
    doc.text(data.clientName || "---", 45, 65);
    
    doc.text("DNI:", 15, 71);
    doc.text(data.clientDNI, 45, 71);
    
    // Línea separadora
    doc.line(15, 76, 195, 76);
    
    // Observaciones
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVACIONES:", 15, 83);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Fecha de emisión: ${data.date}`, 20, 89);
    doc.text(`Método de pago: ${data.paymentMethod}`, 20, 94);
    doc.text(`Método de entrega: ${data.deliveryMethod}`, 20, 99);
    
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(15, 103, 195, 103);
    
    // Tabla de productos - Cabecera
    const startY = 110;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, startY - 5, 180, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Cantidad", 20, startY);
    doc.text("U.M.", 45, startY);
    doc.text("Descripción", 80, startY, { align: "center" });
    doc.text("Precio unit.", 145, startY, { align: "center" });
    doc.text("Importe (IGV)", 178, startY, { align: "right" });
    
    doc.setLineWidth(0.3);
    doc.line(15, startY + 2, 195, startY + 2);
    
    // Items de productos
    doc.setFont("helvetica", "normal");
    let currentY = startY + 10;
    data.items.forEach((item, index) => {
        if (currentY > 230) {
            doc.addPage();
            currentY = 20;
        }
        
        // Fondo alternado para mejor legibilidad
        if (index % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(15, currentY - 4, 180, 7, 'F');
        }
        
        doc.text(item.quantity.toString(), 20, currentY);
        doc.text("UND", 45, currentY);
        doc.text(item.name.substring(0, 35), 65, currentY);
        doc.text(`S/ ${item.unitPrice.toFixed(2)}`, 145, currentY, { align: "center" });
        doc.text(`S/ ${item.total.toFixed(2)}`, 178, currentY, { align: "right" });
        currentY += 7;
    });
    
    // Línea separadora antes de totales
    currentY += 5;
    doc.setLineWidth(0.5);
    doc.line(15, currentY, 195, currentY);
    
    // Totales
    currentY += 10;
    const baseImponible = data.total / 1.18;
    const igvCalculado = data.total - baseImponible;
    
    // SON en letras
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("SON:", 15, currentY);
    doc.setFont("helvetica", "normal");
    const sonTexto = numeroALetras(data.total);
    doc.text(sonTexto, 28, currentY);
    
    // Cuadro de totales
    const totalsStartY = currentY + 5;
    doc.setLineWidth(0.3);
    doc.rect(130, totalsStartY, 65, 25);
    
    doc.setFontSize(9);
    doc.text("O.P. GRAVADA (S/)", 135, totalsStartY + 6);
    doc.text(`S/ ${baseImponible.toFixed(2)}`, 188, totalsStartY + 6, { align: "right" });
    
    doc.line(130, totalsStartY + 8, 195, totalsStartY + 8);
    
    doc.text("TOTAL IGV (S/)", 135, totalsStartY + 14);
    doc.text(`S/ ${igvCalculado.toFixed(2)}`, 188, totalsStartY + 14, { align: "right" });
    
    doc.line(130, totalsStartY + 16, 195, totalsStartY + 16);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("IMPORTE TOTAL (S/)", 135, totalsStartY + 22);
    doc.text(`S/ ${data.total.toFixed(2)}`, 188, totalsStartY + 22, { align: "right" });
    
    // Pie de página
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Gracias por su preferencia", 105, 275, { align: "center" });
    
    // Descargar
    doc.save(`Boleta_${data.boletaNumber}.pdf`);
}

export async function generateFacturaPDF(data: FacturaData) {
    const doc = new jsPDF();
    
    // Borde exterior del documento
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);
    
    // Agregar logo
    const logoBase64 = await getLogoBase64();
    if (logoBase64) {
        try {
            doc.addImage(logoBase64, 'WEBP', 15, 15, 25, 25);
        } catch (e) {
            console.error('Error agregando logo:', e);
        }
    }
    
    // Encabezado principal
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("HURIOS RALLY E.I.R.L.", 50, 25);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Av. 22 de Agosto 1012, Comas 15312", 15, 31);
    doc.text("Telf: 978 451 154", 15, 36);
    
    // Cuadro RUC y Factura (más grande y destacado)
    doc.setLineWidth(1.5);
    doc.rect(145, 15, 50, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA ELECTRÓNICA", 170, 22, { align: "center" });
    doc.setFontSize(9);
    doc.text("RUC: 20492248933", 170, 29, { align: "center" });
    doc.setFontSize(11);
    doc.text(data.facturaNumber, 170, 41, { align: "center" });
    
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(15, 50, 195, 50);
    
    // Información de emisión
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    let infoY = 57;
    
    doc.setFont("helvetica", "bold");
    doc.text("Fecha de emisión:", 15, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(data.date, 55, infoY);
    
    doc.setFont("helvetica", "bold");
    doc.text("Forma de pago:", 120, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(data.paymentMethod, 160, infoY);
    
    infoY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Señor(es):", 15, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(data.clientName, 55, infoY);
    
    infoY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("RUC:", 15, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(data.clientRUC, 55, infoY);
    
    infoY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Dirección del cliente:", 15, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(data.clientAddress.substring(0, 60), 55, infoY);
    
    infoY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Tipo de moneda:", 15, infoY);
    doc.setFont("helvetica", "normal");
    doc.text("SOLES", 55, infoY);
    
    infoY += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Observación:", 15, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(`Método de entrega: ${data.deliveryMethod}`, 55, infoY);
    
    // Línea separadora
    infoY += 4;
    doc.setLineWidth(0.5);
    doc.line(15, infoY, 195, infoY);
    
    // Tabla de productos - Cabecera
    const startY = infoY + 8;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, startY - 5, 180, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Cantidad", 20, startY);
    doc.text("Unidad de", 48, startY);
    doc.text("medida", 48, startY + 3);
    doc.text("Descripción", 95, startY, { align: "center" });
    doc.text("Valor unitario", 178, startY, { align: "right" });
    
    doc.setLineWidth(0.3);
    doc.line(15, startY + 5, 195, startY + 5);
    
    // Items de productos
    doc.setFont("helvetica", "normal");
    let currentY = startY + 13;
    data.items.forEach((item, index) => {
        if (currentY > 215) {
            doc.addPage();
            currentY = 20;
        }
        
        // Fondo alternado
        if (index % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(15, currentY - 4, 180, 7, 'F');
        }
        
        doc.text(item.quantity.toString(), 20, currentY);
        doc.text("UND", 48, currentY);
        doc.text(item.name.substring(0, 40), 75, currentY);
        doc.text(`S/ ${item.unitPrice.toFixed(2)}`, 178, currentY, { align: "right" });
        currentY += 7;
    });
    
    // Línea separadora antes de totales
    currentY += 5;
    doc.setLineWidth(0.5);
    doc.line(15, currentY, 195, currentY);
    
    // Totales
    currentY = Math.max(currentY + 10, 215);
    
    const baseImponible = data.total / 1.18;
    const igvCalculado = data.total - baseImponible;
    
    // SON en letras
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("SON:", 15, currentY);
    doc.setFont("helvetica", "normal");
    const sonTexto = numeroALetras(data.total);
    doc.text(sonTexto, 28, currentY);
    
    // Cuadro de totales
    const totalsX = 125;
    const labelsX = 130;
    const valuesX = 188;
    
    doc.setLineWidth(0.3);
    doc.rect(totalsX, currentY + 5, 70, 45);
    
    let totalsY = currentY + 11;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    doc.text("Sub Total Ventas", labelsX, totalsY);
    doc.text(`S/ ${data.subtotal.toFixed(2)}`, valuesX, totalsY, { align: "right" });
    
    totalsY += 6;
    doc.text("Anticipos", labelsX, totalsY);
    doc.text(`S/ ${data.anticipos.toFixed(2)}`, valuesX, totalsY, { align: "right" });
    
    totalsY += 6;
    doc.text("Descuentos", labelsX, totalsY);
    doc.text(`S/ ${data.descuentos.toFixed(2)}`, valuesX, totalsY, { align: "right" });
    
    doc.line(totalsX, totalsY + 2, totalsX + 70, totalsY + 2);
    
    totalsY += 6;
    doc.text("Valor venta", labelsX, totalsY);
    doc.text(`S/ ${baseImponible.toFixed(2)}`, valuesX, totalsY, { align: "right" });
    
    totalsY += 6;
    doc.text("ISC", labelsX, totalsY);
    doc.text(`S/ ${data.isc.toFixed(2)}`, valuesX, totalsY, { align: "right" });
    
    totalsY += 6;
    doc.text("IGV", labelsX, totalsY);
    doc.text(`S/ ${igvCalculado.toFixed(2)}`, valuesX, totalsY, { align: "right" });
    
    doc.line(totalsX, totalsY + 2, totalsX + 70, totalsY + 2);
    
    totalsY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Importe Total", labelsX, totalsY);
    doc.text(`S/ ${data.total.toFixed(2)}`, valuesX, totalsY, { align: "right" });
    
    // Pie de página
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Gracias por su preferencia", 105, 275, { align: "center" });
    
    // Descargar
    doc.save(`Factura_${data.facturaNumber}.pdf`);
}
