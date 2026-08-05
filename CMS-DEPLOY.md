# Intervo CMS — operación y despliegue

## Arquitectura

- Next.js sirve el sitio público y `/admin` desde la misma aplicación.
- PostgreSQL guarda documentos, borradores, publicaciones, versiones, usuarios, sesiones,
  auditoría y formularios.
- Replit App Storage guarda uploads de imágenes y videos. Los recursos de `public/` siguen en Git y
  aparecen en la biblioteca como medios virtuales reutilizables.
- Sin `DATABASE_URL`, el sitio público usa los defaults versionados y el panel evita mutaciones que
  aparenten persistencia.
- GitHub Pages es solo respaldo estático; no contiene el backend del CMS.

La entrega a otra cuenta, incluidos el bundle privado y la separación de datos, se documenta en
[REPLIT-HANDOFF.md](./REPLIT-HANDOFF.md).

## Preparar un Replit App

1. Importar `main` desde GitHub.
2. Crear Development Database y App Storage desde el mismo Replit App.
3. Configurar Secrets según `.env.example`.
4. Ejecutar:

   ```bash
   npm ci
   npm run replit:setup
   npm run storage:check
   npm run dev
   ```

5. Entrar a `/admin` con el Dueño recién creado.
6. Eliminar `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD` y `ADMIN_BOOTSTRAP_NAME`.

`replit:preflight` comprueba Node, Database, `SESSION_SECRET`, owner/bootstrap y acceso real a App
Storage sin imprimir valores. Si existe un solo bucket asociado, no se configura Bucket ID.

## Configuración de producción

- Replit runtime: Node 22, sin `replit.nix`.
- Deployment: Autoscale.
- Build: `npm run build`.
- Run: `npm run start`.
- Puerto: 3000.
- `SESSION_SECRET`: mínimo 32 caracteres y distinto al de Development.
- `CONTACT_NOTIFICATION_EMAIL=info@intervo.legal`.
- `NEXT_PUBLIC_SITE_URL`: dominio final del cliente.
- Opcionales: `RESEND_API_KEY`, `OPENAI_API_KEY`, `OPENAI_TRANSLATION_MODEL`.
- `REPLIT_OBJECT_STORAGE_BUCKET_ID`: Configuration opcional, solo si hay varios buckets o falla la autodetección.

Development y Production utilizan bases y Secrets separados. Después de añadir o cambiar Secrets de
producción hay que hacer Republish.

## Comprobación posterior a publicación

1. `GET /api/health` devuelve HTTP 200, `ok: true` y `database: "ok"`.
2. `/es`, `/en`, rutas principales y `/admin/login` responden correctamente.
3. El Dueño inicia sesión y puede guardar un borrador.
4. El borrador no modifica la web; la vista previa sí lo muestra.
5. **Publicar cambios** incrementa la versión y actualiza ES/EN.
6. Una imagen subida puede verse, descargarse y reutilizarse.
7. Repetir Republish y confirmar que contenido y archivo persisten.
8. Un formulario aparece en `/admin/submissions`; Resend es opcional.

## Seguridad y límites

- Imágenes: JPEG, PNG, WebP o AVIF, máximo 20 MB.
- Videos: MP4, WebM o MOV, máximo 200 MB.
- SVG se rechaza y el servidor valida la firma binaria.
- Un medio referenciado por contenido no puede eliminarse.
- El acceso usa correo y contraseña; Editor no publica ni gestiona usuarios.
- Contraseñas con bcrypt (12 rondas), sesiones opacas y cookies HttpOnly/Secure/SameSite.
- Login y formulario tienen rate limit; mutaciones del panel requieren CSRF.
- CSP, HSTS, anti-frame, `nosniff` y políticas restrictivas se aplican en servidor.
- Ejecutar `npm audit`, lint, TypeScript, pruebas y build antes de cada publicación.
- No conservar Secrets de bootstrap ni de transferencia después de utilizarlos.

## Flujo editorial y rollback

1. Editar contenido ES/EN.
2. Elegir **Guardar cambios** y revisar el resumen antes → después.
3. Abrir **Vista previa**.
4. Publicar con Dueño o Administrador.
5. Si algo sale mal, abrir **Versiones**, restaurar como borrador y volver a publicar.

Las traducciones asistidas son propuestas: nunca guardan ni publican por sí solas. Para un rollback de
infraestructura, usar el deployment anterior desde Replit Publishing.
