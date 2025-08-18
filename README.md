# Discord Music Buttons Bot

Un bot intermediario de Discord que proporciona una interfaz de usuario moderna con botones y modales para controlar otro bot de música que funcione con comandos de texto (como `m!p`, `m!leave`, etc.).

## Características

- **Panel de Control Fijo:** Un comando `/setup` que crea un panel con botones para controlar la música.
- **Interfaz Intuitiva:** En lugar de escribir comandos, los usuarios usan botones (▶️ Play, ⏹️ Stop, ⏭️ Next).
- **Modal para Reproducir:** El botón de Play abre un formulario (modal) para que el usuario ingrese el nombre o la URL de la canción.
- **Código Limpio:** Estructura de proyecto profesional en TypeScript, con lógica de negocio separada por funcionalidad.
- **Fácil de Configurar:** Utiliza variables de entorno para una configuración segura y sencilla.

## Prerrequisitos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [npm](https://www.npmjs.com/)
- Otro bot de música ya presente en tu servidor de Discord que responda a comandos de texto.

---

## 📜 Guía de Instalación y Configuración

Sigue estos pasos para configurar y poner en marcha el bot en tu servidor.

### 1. Creación del Bot en Discord

Antes de nada, necesitas crear una aplicación y un bot en el portal de desarrolladores de Discord.

1.  **Ve al [Portal de Desarrolladores de Discord](https://discord.com/developers/applications) y haz clic en "New Application".**
    - Dale un nombre a tu aplicación (por ejemplo, "Music Control") y acepta los términos de servicio.

2.  **Ve a la pestaña "Bot" en el menú de la izquierda.**
    - Haz clic en **"Add Bot"** y confirma.
    - Aquí puedes cambiar el ícono y el nombre de usuario de tu bot.

3.  **Obtén el Token del Bot.**
    - Haz clic en **"Reset Token"** para generar un nuevo token. **¡Copia este token y guárdalo en un lugar seguro!** Lo necesitarás para el archivo `.env`.

4.  **Habilita los "Privileged Gateway Intents".**
    - En la misma pestaña "Bot", baja hasta encontrar la sección de "Privileged Gateway Intents".
    - Activa la opción **"MESSAGE CONTENT INTENT"**. Esto es **obligatorio** para que el bot pueda leer los comandos de música del otro bot.

### 2. Instalación del Código

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tusuario/discord-music-buttons.git
    cd discord-music-buttons
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

### 3. Configuración de Variables de Entorno

1.  **Crea el archivo `.env`:**
    - Renombra o copia el archivo `.env.example` a `.env`.

2.  **Añade las variables al archivo `.env`:**

    ```env
    # El token que obtuviste en el paso 1.3
    DISCORD_TOKEN=AQUI_VA_EL_TOKEN_DE_TU_BOT

    # El ID de cliente de tu aplicación
    CLIENT_ID=AQUI_VA_EL_ID_DE_CLIENTE

    # El ID del servidor (Guild) donde harás las pruebas
    GUILD_ID=AQUI_VA_EL_ID_DE_TU_SERVIDOR
    ```

    - **¿Cómo obtener el `CLIENT_ID`?** Ve a la pestaña "OAuth2" -> "General" en el portal de desarrolladores. Allí encontrarás tu "Client ID".
    - **¿Cómo obtener el `GUILD_ID`?**
        - En Discord, ve a "Ajustes de Usuario" -> "Avanzado" y activa el "Modo de desarrollador".
        - Luego, haz clic derecho sobre el nombre de tu servidor en la lista de servidores y selecciona **"Copiar ID del servidor"**.

### 4. Invitar al Bot a tu Servidor

1.  **Genera el enlace de invitación:**
    - En el portal de desarrolladores, ve a "OAuth2" -> "URL Generator".
    - Selecciona los siguientes scopes:
        - `bot`
        - `applications.commands`
    - En "Bot Permissions", selecciona los permisos que consideres necesarios. Como mínimo, el bot necesita:
        - `View Channel`
        - `Send Messages`
        - `Read Message History`
        - `Use External Emojis` (si usas emojis personalizados en los botones)

2.  **Invita al bot:**
    - Copia la URL generada y pégala en tu navegador.
    - Selecciona el servidor al que quieres invitarlo y autoriza los permisos.

---

## 🚀 Uso del Bot

1.  **Despliega los Comandos Slash:**
    Antes de iniciar el bot, necesitas registrar sus comandos en tu servidor. Ejecuta:
    ```bash
    npm run deploy
    ```
    *Solo necesitas hacer esto una vez, o cada vez que modifiques o añadas nuevos comandos.*

2.  **Inicia el Bot:**
    - Para desarrollo (con recarga automática):
      ```bash
      npm run dev
      ```
    - Para producción:
      ```bash
      npm run start
      ```

3.  **Crea el Panel de Control:**
    - En el canal de texto que prefieras, escribe el comando `/setup`.
    - El bot creará el panel de control y estará listo para usarse.

## 🤖 Comandos Disponibles

- `/setup`: Crea el panel de control con los botones de música en el canal donde se ejecuta el comando.