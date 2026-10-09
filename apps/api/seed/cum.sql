-- Datos ficticios para la prueba de concepto de admisiones CUM.
-- No contiene expedientes ni contactos reales del colegio.
INSERT INTO tenants (id, name, slug, vertical, timezone, assistant_name, privacy_notice_url, brand_primary, brand_accent, created_at)
VALUES ('tnt-cum', 'Centro Universitario Montejo', 'cum', 'education', 'America/Merida', 'Lynna',
        'https://cum.31rooms.com/privacidad.html', '#143b5c', '#d4aa54', unixepoch() * 1000)
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

-- Familias sintéticas verosímiles para gráficos y tablas de la reunión.
-- Los teléfonos no son números reales y los correos pertenecen a example.com.
INSERT INTO prospects (id, tenant_id, phone, name, email, student_name, education_level, target_grade, lead_channel, source, stage, score, next_followup_at, created_at, updated_at) VALUES
('cum-sample-01', 'tnt-cum', 'demo-cum-001', 'Ana Balam', 'familia01.demo@example.com', NULL, 'secundaria', 'primero', 'whatsapp', 'manual', 'new', 45, (unixepoch()+172800)*1000, (unixepoch()-3600)*1000, (unixepoch()-3600)*1000),
('cum-sample-02', 'tnt-cum', 'demo-cum-002', 'Luis Canto', 'familia02.demo@example.com', NULL, 'preparatoria', 'primero', 'web', 'manual', 'new', 55, (unixepoch()+172800)*1000, (unixepoch()-93600)*1000, (unixepoch()-93600)*1000),
('cum-sample-03', 'tnt-cum', 'demo-cum-003', 'Fernanda Poot', 'familia03.demo@example.com', NULL, 'secundaria', 'segundo', 'correo', 'manual', 'qualified', 65, (unixepoch()+172800)*1000, (unixepoch()-97200)*1000, (unixepoch()-97200)*1000),
('cum-sample-04', 'tnt-cum', 'demo-cum-004', 'Miguel Chan', 'familia04.demo@example.com', NULL, 'preparatoria', 'primero', 'telefono', 'manual', 'qualified', 75, (unixepoch()+-86400)*1000, (unixepoch()-187200)*1000, (unixepoch()-187200)*1000),
('cum-sample-05', 'tnt-cum', 'demo-cum-005', 'Patricia May', 'familia05.demo@example.com', NULL, 'secundaria', 'primero', 'presencial', 'manual', 'appointment', 85, (unixepoch()+172800)*1000, (unixepoch()-277200)*1000, (unixepoch()-277200)*1000),
('cum-sample-06', 'tnt-cum', 'demo-cum-006', 'Elena Ek', 'familia06.demo@example.com', NULL, 'preparatoria', 'segundo', 'whatsapp', 'manual', 'visited', 35, (unixepoch()+172800)*1000, (unixepoch()-367200)*1000, (unixepoch()-367200)*1000),
('cum-sample-07', 'tnt-cum', 'demo-cum-007', 'Ricardo Sosa', 'familia07.demo@example.com', NULL, 'secundaria', 'primero', 'whatsapp', 'manual', 'won', 45, NULL, (unixepoch()-457200)*1000, (unixepoch()-457200)*1000),
('cum-sample-08', 'tnt-cum', 'demo-cum-008', 'Daniela Canul', 'familia08.demo@example.com', NULL, 'preparatoria', 'primero', 'web', 'manual', 'lost', 55, NULL, (unixepoch()-518400)*1000, (unixepoch()-518400)*1000),
('cum-sample-09', 'tnt-cum', 'demo-cum-009', 'José Uc', 'familia09.demo@example.com', NULL, 'secundaria', 'segundo', 'correo', 'manual', 'new', 65, (unixepoch()+172800)*1000, (unixepoch()-608400)*1000, (unixepoch()-608400)*1000),
('cum-sample-10', 'tnt-cum', 'demo-cum-010', 'Claudia Dzib', 'familia10.demo@example.com', NULL, 'preparatoria', 'primero', 'telefono', 'manual', 'new', 75, (unixepoch()+172800)*1000, (unixepoch()-698400)*1000, (unixepoch()-698400)*1000),
('cum-sample-11', 'tnt-cum', 'demo-cum-011', 'Paola Herrera', 'familia11.demo@example.com', NULL, 'secundaria', 'primero', 'presencial', 'manual', 'qualified', 85, (unixepoch()+172800)*1000, (unixepoch()-874800)*1000, (unixepoch()-874800)*1000),
('cum-sample-12', 'tnt-cum', 'demo-cum-012', 'Arturo Kú', 'familia12.demo@example.com', NULL, 'preparatoria', 'segundo', 'whatsapp', 'manual', 'qualified', 35, (unixepoch()+-86400)*1000, (unixepoch()-1051200)*1000, (unixepoch()-1051200)*1000),
('cum-sample-13', 'tnt-cum', 'demo-cum-013', 'Marcela Novelo', 'familia13.demo@example.com', NULL, 'secundaria', 'primero', 'whatsapp', 'manual', 'appointment', 45, (unixepoch()+172800)*1000, (unixepoch()-1227600)*1000, (unixepoch()-1227600)*1000),
('cum-sample-14', 'tnt-cum', 'demo-cum-014', 'Héctor Tzec', 'familia14.demo@example.com', NULL, 'preparatoria', 'primero', 'web', 'manual', 'visited', 55, (unixepoch()+172800)*1000, (unixepoch()-1490400)*1000, (unixepoch()-1490400)*1000),
('cum-sample-15', 'tnt-cum', 'demo-cum-015', 'Gabriela Méndez', 'familia15.demo@example.com', NULL, 'secundaria', 'segundo', 'correo', 'manual', 'won', 65, NULL, (unixepoch()-1753200)*1000, (unixepoch()-1753200)*1000),
('cum-sample-16', 'tnt-cum', 'demo-cum-016', 'Sergio Pool', 'familia16.demo@example.com', NULL, 'preparatoria', 'primero', 'telefono', 'manual', 'lost', 75, NULL, (unixepoch()-1987200)*1000, (unixepoch()-1987200)*1000),
('cum-sample-17', 'tnt-cum', 'demo-cum-017', 'Valeria Castro', 'familia17.demo@example.com', NULL, 'secundaria', 'primero', 'presencial', 'manual', 'new', 85, (unixepoch()+172800)*1000, (unixepoch()-2336400)*1000, (unixepoch()-2336400)*1000),
('cum-sample-18', 'tnt-cum', 'demo-cum-018', 'César Tun', 'familia18.demo@example.com', NULL, 'preparatoria', 'segundo', 'whatsapp', 'manual', 'new', 35, (unixepoch()+172800)*1000, (unixepoch()-2772000)*1000, (unixepoch()-2772000)*1000),
('cum-sample-19', 'tnt-cum', 'demo-cum-019', 'María Ku', 'familia19.demo@example.com', NULL, 'secundaria', 'primero', 'whatsapp', 'manual', 'qualified', 45, (unixepoch()+172800)*1000, (unixepoch()-3294000)*1000, (unixepoch()-3294000)*1000),
('cum-sample-20', 'tnt-cum', 'demo-cum-020', 'Rafael Solís', 'familia20.demo@example.com', NULL, 'preparatoria', 'primero', 'web', 'manual', 'qualified', 55, (unixepoch()+-86400)*1000, (unixepoch()-3902400)*1000, (unixepoch()-3902400)*1000),
('cum-sample-21', 'tnt-cum', 'demo-cum-021', 'Carolina Mena', 'familia21.demo@example.com', NULL, 'secundaria', 'segundo', 'correo', 'manual', 'appointment', 65, (unixepoch()+172800)*1000, (unixepoch()-4597200)*1000, (unixepoch()-4597200)*1000),
('cum-sample-22', 'tnt-cum', 'demo-cum-022', 'Alejandro Chi', 'familia22.demo@example.com', NULL, 'preparatoria', 'primero', 'telefono', 'manual', 'visited', 75, (unixepoch()+172800)*1000, (unixepoch()-5292000)*1000, (unixepoch()-5292000)*1000),
('cum-sample-23', 'tnt-cum', 'demo-cum-023', 'Mónica Xool', 'familia23.demo@example.com', NULL, 'secundaria', 'primero', 'presencial', 'manual', 'won', 85, NULL, (unixepoch()-6246000)*1000, (unixepoch()-6246000)*1000),
('cum-sample-24', 'tnt-cum', 'demo-cum-024', 'Iván Aguilar', 'familia24.demo@example.com', NULL, 'preparatoria', 'segundo', 'whatsapp', 'manual', 'lost', 35, NULL, (unixepoch()-7344000)*1000, (unixepoch()-7344000)*1000)
ON CONFLICT(id) DO NOTHING;
