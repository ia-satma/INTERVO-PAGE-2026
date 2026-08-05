# Entrega de Intervo a la cuenta Replit del cliente

Esta guía traslada el proyecto sin compartir infraestructura ni accesos de SATMA. GitHub entrega el
código; PostgreSQL y App Storage reciben por separado únicamente contenido editorial, versiones y
uploads. No se transfieren usuarios, contraseñas, sesiones, formularios, auditoría ni rate limits.

## 1. Importar el código

1. En la cuenta Replit del cliente, elegir **Create App → Import from GitHub**.
2. Importar `https://github.com/ia-satma/INTERVO-PAGE-2026` desde la rama `main`.
3. Confirmar que Replit cargó Node 22. El repositorio declara `modules = ["nodejs-22"]` y exige
   Node `>=22.12.0`; no usa `replit.nix`.
4. No crear ramas en Replit. Los ajustes futuros llegarán siempre desde `main`.

El repositorio seguirá público durante la importación y los ajustes. Se volverá privado cuando el
cliente confirme la recepción final.

## 2. Crear infraestructura nueva

### Database

1. Abrir **Database** y crear la Development Database.
2. Al preparar la publicación, crear o seleccionar una Production Database distinta.
3. Replit proporciona `DATABASE_URL` a cada entorno. No copiar el valor de SATMA.

### App Storage

1. Abrir **App Storage** en el mismo Replit App y crear/asociar un bucket.
2. No guardar el nombre del bucket como Secret. El SDK oficial se autentica y encuentra el bucket
   asociado mediante `new Client()`.
3. `Total 0` es normal antes de hacer el primer upload: las imágenes versionadas viven en `public/`.
4. Solo si hay varios buckets o la detección automática falla, crear la **Configuration**
   `REPLIT_OBJECT_STORAGE_BUCKET_ID` con el Bucket ID que aparece en Settings.

Development y Production tienen bases y Secrets separados. App Storage pertenece al Replit App y
los uploads no deben escribirse en el filesystem efímero del deployment.

## 3. Configurar Secrets y Configurations

Permanentes por entorno:

- `DATABASE_URL`: la crea Replit Database.
- `SESSION_SECRET`: cadena aleatoria de 32 caracteres o más, diferente en Development y Production.
- `CONTACT_NOTIFICATION_EMAIL=info@intervo.legal`.
- `NEXT_PUBLIC_SITE_URL`: URL final del deployment del cliente, sin `/` final.
- Opcionales: `RESEND_API_KEY`, `OPENAI_API_KEY`, `OPENAI_TRANSLATION_MODEL`.

Temporales para crear el primer Dueño:

- `ADMIN_BOOTSTRAP_EMAIL`.
- `ADMIN_BOOTSTRAP_PASSWORD`: contraseña nueva de 16 caracteres o más.
- `ADMIN_BOOTSTRAP_NAME`.

Después de crear el Dueño, eliminar los tres valores de bootstrap. La base conserva únicamente el
hash bcrypt de la contraseña. Nunca pegar valores de Secrets en Git, README, chat o capturas.

## 4. Preparar Development

En Shell:

```bash
npm ci
npm run replit:setup
npm run storage:check
npm run dev
```

`replit:setup` valida el entorno sin imprimir valores, aplica migraciones y ejecuta el seed
idempotente. `storage:check` sube, lee, compara y elimina un objeto temporal.

Verificar:

- `/api/health` responde `ok: true` y `database: "ok"`.
- `/es`, `/en` y `/admin/login` cargan.
- El nuevo Dueño puede iniciar sesión.
- Un upload puede verse, descargarse y reutilizarse desde Medios.

## 5. Crear el paquete privado en el origen

En el Replit de SATMA, apuntando a la base de producción actual:

```bash
npm run handoff:export -- --database-env HANDOFF_SOURCE_DATABASE_URL
```

El resultado queda en `.handoff/intervo-<fecha>/`, carpeta ignorada por Git. Contiene:

- documentos CMS en borrador y publicados;
- historial de versiones;
- metadatos de medios activos;
- binarios subidos a App Storage;
- manifiesto SHA-256 con conteos y exclusiones.

El comando no exporta `admin_users`, `admin_sessions`, `audit_logs`, `contact_submissions` ni
`rate_limit_counters`. Transferir el directorio por un canal privado y borrar después el Secret
`HANDOFF_SOURCE_DATABASE_URL` y cualquier copia temporal que ya no sea necesaria.

## 6. Importar el paquete en la cuenta del cliente

Subir el bundle privado a `.handoff/` del Replit del cliente; esa ruta nunca se versiona. Primero
importar en Development:

```bash
npm run handoff:import -- .handoff/intervo-<fecha>
```

La importación valida todos los hashes, sube los objetos y hace upsert de contenido, versiones y
medios. Es idempotente: se puede repetir con el mismo paquete sin duplicar registros.

Para Production, usar temporalmente una conexión explícita al destino:

```bash
npm run handoff:import -- .handoff/intervo-<fecha> --database-env HANDOFF_TARGET_DATABASE_URL
```

Eliminar `HANDOFF_TARGET_DATABASE_URL` al terminar. No confundir la Development Database con la
Production Database.

## 7. Publicar y aceptar la entrega

1. En Publishing elegir **Autoscale**. Build: `npm run build`; Run: `npm run start`; puerto 3000.
2. Añadir los Secrets de producción antes del build.
3. Publicar y probar `/api/health`, sitio ES/EN, login, borrador, vista previa y publicación.
4. Subir una imagen de prueba, descargarla y reutilizarla.
5. Hacer un segundo **Republish**.
6. Confirmar que contenido, versiones y archivo continúan disponibles después del segundo Republish.
7. Eliminar Secrets de bootstrap y transferencia. Conservar solo los permanentes.

Si algo falla, hacer rollback al deployment anterior desde Replit. El contenido editorial puede
restaurarse desde **Versiones** dentro del panel.

## 8. Recibir ajustes futuros

Antes de sincronizar, detener el servidor de desarrollo. Luego:

```bash
cd ~/workspace
git fetch origin main
git rebase origin/main
npm ci
npm run db:migrate
npm run dev
```

Si Replit creó commits locales, hacer una rama de respaldo local antes del rebase y eliminarla al
terminar. Nunca subir ramas de respaldo al remoto. SATMA publicará cambios únicamente en `main`.

Cuando el cliente apruebe la entrega final, el repositorio pasa a privado y GitHub Pages se desactiva
o redirige al dominio definitivo.
