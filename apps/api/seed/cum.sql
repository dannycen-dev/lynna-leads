-- Datos ficticios para la prueba de concepto de admisiones CUM.
-- No contiene expedientes ni contactos reales del colegio.
INSERT INTO tenants (id, name, slug, vertical, timezone, assistant_name, privacy_notice_url, brand_primary, brand_accent, created_at)
VALUES ('tnt-cum', 'Centro Universitario Montejo', 'cum', 'education', 'America/Merida', 'Lynna',
        'https://cum.edu.mx/wp-content/uploads/2022/05/Aviso-de-Privacidad-CUM-22-23.pdf', '#143b5c', '#d4aa54', unixepoch() * 1000)
ON CONFLICT(id) DO UPDATE SET name=excluded.name, vertical=excluded.vertical, timezone=excluded.timezone,
  assistant_name=excluded.assistant_name, privacy_notice_url=excluded.privacy_notice_url,
  brand_primary=excluded.brand_primary, brand_accent=excluded.brand_accent;

INSERT INTO kb_articles (id, tenant_id, title, body, keywords, category, status, approved_at, created_at, updated_at) VALUES
('cum-kb-niveles', 'tnt-cum', 'Niveles educativos', 'El Centro Universitario Montejo ofrece secundaria y preparatoria. El equipo de admisiones confirma el grado y el proceso que corresponde a cada familia.', 'secundaria preparatoria prepa bachillerato grados', 'general', 'approved', unixepoch()*1000, unixepoch()*1000, unixepoch()*1000),
('cum-kb-ubicacion', 'tnt-cum', 'Ubicación y contacto', 'El campus está en Calle 60 No. 106 por 21 y 23, colonia Loma Bonita, Mérida, Yucatán. Teléfono publicado por el colegio: (999) 942-9370. La familia puede solicitar al equipo de admisiones una visita al campus.', 'direccion ubicacion campus visita recorrido telefono', 'oficina', 'approved', unixepoch()*1000, unixepoch()*1000, unixepoch()*1000),
('cum-kb-modelo', 'tnt-cum', 'Comunidad marista', 'El CUM es una institución marista de Mérida con formación integral. Su lema publicado es Ser para servir. Ofrece actividades académicas, deportivas y culturales.', 'marista formacion deportes valores colegio', 'general', 'approved', unixepoch()*1000, unixepoch()*1000, unixepoch()*1000),
('cum-kb-admision', 'tnt-cum', 'Información de admisión', 'Para iniciar la conversación de admisión, indique si busca secundaria o preparatoria y el grado de interés. El equipo de admisiones confirma requisitos, fechas de examen, cupo y siguientes pasos vigentes. La información de ciclos anteriores no confirma el ciclo actual.', 'inscripcion examen fechas requisitos cupos admisiones informacion', 'general', 'approved', unixepoch()*1000, unixepoch()*1000, unixepoch()*1000),
('cum-kb-costos', 'tnt-cum', 'Colegiaturas', 'El equipo de admisiones confirma las colegiaturas y condiciones vigentes de forma personalizada. La asistente virtual no da montos sin una lista oficial actualizada.', 'costo precio colegiatura pago becas', 'pagos', 'approved', unixepoch()*1000, unixepoch()*1000, unixepoch()*1000)
ON CONFLICT(id) DO UPDATE SET body=excluded.body, keywords=excluded.keywords, status=excluded.status, updated_at=excluded.updated_at;

INSERT INTO prospects (id, tenant_id, phone, name, email, student_name, education_level, target_grade, lead_channel, source, stage, score, next_followup_at, created_at, updated_at) VALUES
('cum-lead-1', 'tnt-cum', '529991000001', 'Mariana Torres', 'mariana.demo@example.com', 'Estudiante demo A', 'secundaria', 'primero', 'web', 'manual', 'new', 40, (unixepoch()-7200)*1000, (unixepoch()-259200)*1000, (unixepoch()-7200)*1000),
('cum-lead-2', 'tnt-cum', '529991000002', 'Carlos Pech', 'carlos.demo@example.com', 'Estudiante demo B', 'preparatoria', 'primero', 'correo', 'manual', 'qualified', 55, (unixepoch()+86400)*1000, (unixepoch()-172800)*1000, (unixepoch()-86400)*1000),
('cum-lead-3', 'tnt-cum', '529991000003', 'Andrea Vargas', 'andrea.demo@example.com', 'Estudiante demo C', 'secundaria', 'segundo', 'whatsapp', 'manual', 'appointment', 70, (unixepoch()+172800)*1000, (unixepoch()-604800)*1000, (unixepoch()-86400)*1000),
('cum-lead-4', 'tnt-cum', '529991000004', 'Jorge Medina', 'jorge.demo@example.com', 'Estudiante demo D', 'preparatoria', 'primero', 'telefono', 'manual', 'visited', 80, (unixepoch()-3600)*1000, (unixepoch()-432000)*1000, (unixepoch()-3600)*1000),
('cum-lead-5', 'tnt-cum', '529991000005', 'Lucía Canché', 'lucia.demo@example.com', NULL, 'secundaria', NULL, 'presencial', 'manual', 'won', 100, NULL, (unixepoch()-864000)*1000, (unixepoch()-345600)*1000),
('cum-lead-6', 'tnt-cum', '529991000006', 'Roberto Aguilar', 'roberto.demo@example.com', NULL, 'preparatoria', NULL, 'web', 'manual', 'lost', 10, NULL, (unixepoch()-950400)*1000, (unixepoch()-259200)*1000)
ON CONFLICT(id) DO NOTHING;

INSERT INTO prospect_notes (id, tenant_id, prospect_id, author_user_id, body, created_at) VALUES
('cum-note-1', 'tnt-cum', 'cum-lead-1', NULL, 'Demo: pidió información por la web; pendiente confirmar grado y ofrecer recorrido.', (unixepoch()-7200)*1000),
('cum-note-2', 'tnt-cum', 'cum-lead-4', NULL, 'Demo: conoció el campus; dar seguimiento sobre requisitos vigentes.', (unixepoch()-3600)*1000)
ON CONFLICT(id) DO NOTHING;
