/**
 * pdf-generator.js — Generación de PDF con jsPDF
 * Incluye: datos del paciente, texto legal, checkboxes, firma, sello de fecha
 */

class GeneradorPDF {
  constructor(config) {
    this.clinicaNombre = config.clinicaNombre || 'Cass Beauty';
    this.procedimiento = config.procedimiento;
    this.colorRosa = [201, 99, 122];
    this.colorGris = [107, 107, 107];
    this.colorNegro = [26, 26, 26];
  }

  _addHeader(doc, pageWidth) {
    // Fondo del header
    doc.setFillColor(...this.colorRosa);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Nombre de la clínica
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('CLÍNICA ESTÉTICA', pageWidth / 2, 12, { align: 'center' });

    // Nombre principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(this.clinicaNombre.toUpperCase(), pageWidth / 2, 24, { align: 'center' });

    // Subtítulo procedimiento
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`CONSENTIMIENTO INFORMADO — ${this.procedimiento.toUpperCase()}`, pageWidth / 2, 34, { align: 'center' });
  }

  _addFooter(doc, pageWidth, pageHeight, pageNum, totalPages) {
    doc.setFillColor(245, 245, 245);
    doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');

    doc.setFontSize(8);
    doc.setTextColor(...this.colorGris);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${this.clinicaNombre} • Documento generado digitalmente • ${new Date().toLocaleString('es-MX')}`,
      pageWidth / 2, pageHeight - 7, { align: 'center' }
    );
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 15, pageHeight - 7, { align: 'right' });
  }

  _seccionTitulo(doc, texto, y) {
    doc.setFillColor(...this.colorRosa);
    doc.rect(15, y, 3, 7, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.colorRosa);
    doc.text(texto.toUpperCase(), 22, y + 6);
    return y + 14;
  }

  _checkmark(doc, x, y, marcado) {
    doc.setDrawColor(...this.colorGris);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, 5, 5, 1, 1, 'S');
    if (marcado) {
      doc.setTextColor(46, 125, 82);
      doc.setFontSize(8);
      doc.text('✓', x + 0.8, y + 4.2);
    }
  }

  _textoCortado(doc, texto, x, y, maxWidth) {
    const lineas = doc.splitTextToSize(texto, maxWidth);
    doc.text(lineas, x, y);
    return lineas.length * 5.5;
  }

  async generar(datos) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margen = 15;
    const ancho = pageWidth - margen * 2;

    let y = 0;

    // ── PÁGINA 1 ─────────────────────────────────
    this._addHeader(doc, pageWidth);
    y = 50;

    // ── DATOS DEL DOCUMENTO ──
    doc.setFillColor(252, 235, 240);
    doc.roundedRect(margen, y, ancho, 20, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...this.colorGris);
    doc.setFont('helvetica', 'normal');
    const ahora = new Date();
    doc.text(`Folio: ${datos.folio}`, margen + 5, y + 7);
    doc.text(`Fecha: ${ahora.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margen + 5, y + 14);
    doc.text(`Hora: ${ahora.toLocaleTimeString('es-MX')}`, pageWidth - margen - 5, y + 7, { align: 'right' });
    doc.text(`Terapeuta: ${datos.terapeuta || '—'}`, pageWidth - margen - 5, y + 14, { align: 'right' });
    y += 28;

    // ── DATOS DEL PACIENTE ──
    y = this._seccionTitulo(doc, '1. Datos del Paciente', y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.colorNegro);

    const camposPaciente = [
      ['Nombre completo', datos.nombre],
      ['Fecha de nacimiento', datos.fechaNacimiento],
      ['Edad', datos.edad ? `${datos.edad} años` : '—'],
    ];

    camposPaciente.forEach(([label, valor]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...this.colorGris);
      doc.setFontSize(8);
      doc.text(label.toUpperCase(), margen, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...this.colorNegro);
      doc.setFontSize(12);
      doc.text(valor || '—', margen, y + 6);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margen, y + 8, margen + ancho, y + 8);
      y += 16;
    });

    // ── DATOS DEL PROCEDIMIENTO ──
    y += 4;
    y = this._seccionTitulo(doc, `2. Datos del Procedimiento — ${this.procedimiento}`, y);

    datos.camposProcedimiento.forEach(([label, valor]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...this.colorGris);
      doc.setFontSize(8);
      doc.text(label.toUpperCase(), margen, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...this.colorNegro);
      doc.setFontSize(11);
      const alto = this._textoCortado(doc, valor || '—', margen, y + 6, ancho);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margen, y + 6 + alto, margen + ancho, y + 6 + alto);
      y += Math.max(16, alto + 10);
    });

    // ── TEXTO DEL CONSENTIMIENTO ──
    if (y > pageHeight - 80) {
      doc.addPage();
      this._addHeader(doc, pageWidth);
      y = 50;
    }

    y += 4;
    y = this._seccionTitulo(doc, '3. Información Médica y Consentimiento', y);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.colorNegro);

    for (const parrafo of datos.textosLegales) {
      if (y > pageHeight - 40) {
        this._addFooter(doc, pageWidth, pageHeight, doc.internal.getNumberOfPages(), '?');
        doc.addPage();
        this._addHeader(doc, pageWidth);
        y = 50;
      }

      if (parrafo.startsWith('##')) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.colorRosa);
        doc.setFontSize(9);
        doc.text(parrafo.replace('## ', '').toUpperCase(), margen, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.colorNegro);
        y += 7;
      } else {
        doc.setFontSize(9.5);
        const lineas = doc.splitTextToSize(parrafo, ancho);
        doc.text(lineas, margen, y);
        y += lineas.length * 5.5 + 3;
      }
    }

    // ── CONTRAINDICACIONES ──
    if (y > pageHeight - 80) {
      this._addFooter(doc, pageWidth, pageHeight, doc.internal.getNumberOfPages(), '?');
      doc.addPage();
      this._addHeader(doc, pageWidth);
      y = 50;
    }

    y += 6;
    y = this._seccionTitulo(doc, '4. Declaración de Contraindicaciones', y);

    doc.setFontSize(9.5);
    doc.setTextColor(...this.colorNegro);
    const introContra = 'El paciente declara NO presentar ninguna de las siguientes contraindicaciones al momento del tratamiento:';
    const lineasIntro = doc.splitTextToSize(introContra, ancho);
    doc.text(lineasIntro, margen, y);
    y += lineasIntro.length * 5.5 + 6;

    for (const [texto, marcado] of datos.contraindicaciones) {
      if (y > pageHeight - 35) {
        this._addFooter(doc, pageWidth, pageHeight, doc.internal.getNumberOfPages(), '?');
        doc.addPage();
        this._addHeader(doc, pageWidth);
        y = 50;
      }
      this._checkmark(doc, margen, y - 4, marcado);
      doc.setFontSize(9.5);
      doc.setTextColor(...this.colorNegro);
      const lineas = doc.splitTextToSize(texto, ancho - 12);
      doc.text(lineas, margen + 8, y);
      y += lineas.length * 5.5 + 3;
    }

    // ── FIRMA ──
    if (y > pageHeight - 90) {
      this._addFooter(doc, pageWidth, pageHeight, doc.internal.getNumberOfPages(), '?');
      doc.addPage();
      this._addHeader(doc, pageWidth);
      y = 50;
    }

    y += 10;
    y = this._seccionTitulo(doc, '5. Firma del Paciente', y);

    const textoDeclaro = `Yo, ${datos.nombre}, declaro haber leído y comprendido completamente el presente consentimiento informado. He tenido la oportunidad de hacer preguntas sobre el procedimiento de ${this.procedimiento} y estas han sido respondidas satisfactoriamente. Acepto voluntariamente someterme a dicho procedimiento.`;
    doc.setFontSize(9.5);
    const lineasDeclaro = doc.splitTextToSize(textoDeclaro, ancho);
    doc.text(lineasDeclaro, margen, y);
    y += lineasDeclaro.length * 5.5 + 8;

    // Caja de firma
    if (datos.firmaBase64) {
      doc.addImage(datos.firmaBase64, 'PNG', margen, y, ancho * 0.55, 35);
    }

    // Línea de firma
    doc.setDrawColor(...this.colorNegro);
    doc.setLineWidth(0.5);
    doc.line(margen, y + 38, margen + ancho * 0.55, y + 38);
    doc.setFontSize(8);
    doc.setTextColor(...this.colorGris);
    doc.text('Firma del paciente', margen, y + 44);
    doc.text(datos.nombre || '', margen, y + 50);

    // Fecha en el lado derecho de la firma
    doc.text('Lugar y fecha:', pageWidth - margen - ancho * 0.4, y + 33);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...this.colorNegro);
    doc.text(ahora.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margen - ancho * 0.4, y + 40);
    doc.text(ahora.toLocaleTimeString('es-MX'), pageWidth - margen - ancho * 0.4, y + 47);

    y += 60;

    // ── SELLO FINAL ──
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(margen, y, ancho, 18, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...this.colorGris);
    doc.text(
      `Documento generado digitalmente por el sistema Cass Beauty | Folio: ${datos.folio} | ${new Date().toISOString()}`,
      pageWidth / 2, y + 10, { align: 'center' }
    );

    // Numerar páginas
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      this._addFooter(doc, pageWidth, pageHeight, i, totalPaginas);
    }

    return doc;
  }
}

function generarFolio() {
  const ahora = new Date();
  const fecha = ahora.toISOString().slice(0,10).replace(/-/g,'');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CB-${fecha}-${rand}`;
}
