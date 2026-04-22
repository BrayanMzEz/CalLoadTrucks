## CalLoadTrucks

Calculadora de pesos (libras) para cargas de Trailers. Puedes cambiar los valores dependiendo del peso de tu tráiler y cuanto producto es que puedes llevar como máximo.

### Características Principales
- Tres modos operativos: Papera, Hopper, Rifers
- Validación en tiempo real (feedback visual verde/amarillo/rojo)
- Cálculo automático de peso del quinto ruedo (tractor - eje delantero)
- Modo Hopper incluye peso del pup en total (tractor + remolque + pup)
- Funcionalidad offline mediante Service Worker

### Arquitectura
- **Stack:** JavaScript puro, HTML, CSS
- **Archivos principales:**
  - `index.html` - Interfaz de usuario principal
  - `app.js` - Lógica de la aplicación
  - `styles.css` - Estilizado con variables CSS
  - `sw.js` - Service Worker para offline
- **Almacenamiento local:**
  - `trailerLimits_papera`
  - `trailerLimits_hopper`
  - `trailerLimits_rifers`

### Cómo Usarlo
1. Abre `index.html` en tu navegador
2. Sirve mediante XAMPP (`C:\xampp\htdocs\`) para desarrollo local
3. Sin comandos de construcción: archivos estáticos servidos directamente

### Notas de Desarrollo
- Todos los cálculos usan la fórmula: quinto ruedo = tractor - eje delantero
- Validación proporciona retroalimentación en tiempo real basada en límites
- Service Worker habilita funcionalidad offline para uso móvil

Documentación: [CLAUDE.md](C:\xampp\htdocs\CalcLoadTrucks\CLAUDE.md)