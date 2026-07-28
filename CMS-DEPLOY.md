# Intervo CMS — configuración y despliegue

## 1. Arquitectura

- Next.js sirve el sitio público y `/admin` desde la misma aplicación.
- PostgreSQL guarda documentos, borradores, publicaciones, versiones, usuarios, sesiones,
  auditoría y formularios.
- Replit App Storage guarda imágenes y videos. Los archivos históricos dentro de `public/`
  aparecen como referencias virtuales reutilizables.
- Sin `DATABASE_URL`, el sitio público usa los defaults versionados. Las operaciones del panel
  responden `503` para evitar una falsa persistencia.
- GitHub Pages conserva su workflow estático; el backend no se publica ahí.

## 2. Preparar Replit

1. Importar el repositorio desde GitHub.
2. Abrir **Database** y crear/conectar las bases Development y Production.
3. Abrir **App Storage**, crear un bucket y asociarlo con la aplicación.
4. Crear Secrets a partir de `.env.example`:
   - `SESSION_SECRET`: valor aleatorio único de al menos 32 caracteres; usa uno distinto en Development y Production.
   - `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD` (frase única de 16+ caracteres), `ADMIN_BOOTSTRAP_NAME`.
   - `CONTACT_NOTIFICATION_EMAIL`.
   - Opcionales: `RESEND_API_KEY`, `OPENAI_API_KEY`, `OPENAI_TRANSLATION_MODEL`.
5. Ejecutar:

   ```bash
   npm install
   npm run db:migrate
   npm run db:seed
   ```

6. Eliminar `ADMIN_BOOTSTRAP_PASSWORD` de Secrets después de crear el owner. El seed es idempotente y no lo vuelve a necesitar.
7. Iniciar la app, entrar a `/admin` y activar MFA con una aplicación TOTP.

## 3. Producción

1. En Replit Publishing elegir **Autoscale**.
2. Crear/seleccionar la Production Database.
3. Replicar los Secrets necesarios en producción.
4. Ejecutar las migraciones contra la base de producción antes del primer corte.
5. Publicar y verificar:
   - `GET /api/health` devuelve HTTP `200`, `ok: true` y `database: "ok"`.
   - El owner entra, activa MFA y puede guardar un borrador.
   - El borrador no cambia la URL pública.
   - La vista protegida muestra el borrador.
   - Publicar incrementa la versión y actualiza ES/EN.
   - Una imagen subida permanece después de republicar.
   - Un formulario aparece en `/admin/submissions` y, si Resend está activo, llega el correo.

## 4. Límites y seguridad

- Imágenes: JPEG, PNG, WebP o AVIF, máximo 20 MB.
- Videos: MP4, WebM o MOV, máximo 200 MB.
- SVG se rechaza. El servidor valida la firma binaria, no solo nombre/extensión.
- Un medio referenciado por contenido no se elimina.
- Dueño y Administrador requieren MFA. Editor no puede publicar ni gestionar usuarios.
- Las cookies de sesión son HttpOnly, Secure en producción y SameSite Strict.
- Login y formulario tienen rate limit; todas las mutaciones del panel requieren CSRF.
- El rate limit se guarda en PostgreSQL y se comparte entre instancias Autoscale.
- Las respuestas usan CSP, HSTS, protección anti-frame, `nosniff` y políticas restrictivas del navegador.
- No reutilices la contraseña temporal usada durante desarrollo. Antes de publicar, crea una frase nueva,
  activa MFA y elimina el Secret de bootstrap.
- Ejecuta `npm audit` antes de cada publicación y aplica primero las actualizaciones en una URL de prueba.

## 5. Operación editorial

1. Editar contenido ES/EN.
2. Guardar borrador y confirmar el resumen.
3. Abrir **Vista previa**.
4. Publicar con Dueño o Administrador.
5. Si algo sale mal, abrir **Versiones**, restaurar una como borrador y volver a publicar.

Las traducciones por IA son propuestas: nunca guardan ni publican por sí solas.
