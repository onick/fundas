# 🚀 GUÍA DE DEPLOYMENT - EMPÁCAME

Esta guía te ayudará a publicar tu landing page de Empácame en diferentes plataformas de hosting.

## 📋 Preparación Previa

Antes de hacer el deployment, asegúrate de:

1. **Actualizar información de contacto**:
   - Cambiar números de WhatsApp en `index.html` y `main.js`
   - Actualizar emails de contacto
   - Verificar enlaces de redes sociales

2. **Configurar Analytics**:
   - Agregar Google Analytics ID
   - Configurar Facebook Pixel (opcional)
   - Actualizar tracking IDs en el código

3. **Optimizar imágenes**:
   - Comprimir todas las imágenes
   - Verificar que todas las rutas sean correctas
   - Agregar favicon personalizado

## 🌐 Opciones de Hosting

### 1. Netlify (Recomendado - Gratis)

**Ventajas**: Deploy automático, HTTPS gratis, CDN global, formularios

**Pasos**:
1. Crear cuenta en [netlify.com](https://netlify.com)
2. Conectar repositorio de Git o subir carpeta
3. Configurar dominio personalizado (opcional)

**Configuración**:
```bash
# Crear archivo _redirects en la raíz
echo "https://www.empacame.com/* https://empacame.com/:splat 301!" > _redirects
```

### 2. Vercel (Gratis)

**Ventajas**: Deploy instantáneo, edge functions, analytics

**Pasos**:
1. Crear cuenta en [vercel.com](https://vercel.com)
2. Importar proyecto desde Git
3. Deploy automático en cada push

**Configuración**: Ver `vercel.json` en el proyecto

### 3. GitHub Pages (Gratis)

**Ventajas**: Integración directa con GitHub, dominio gratuito

**Pasos**:
1. Subir código a repositorio de GitHub
2. Ir a Settings > Pages
3. Seleccionar source branch (main)
4. Acceder via `usuario.github.io/empacame`

### 4. Hosting Tradicional (Pagado)

**Para proveedores como SiteGround, HostGator, etc.**

**Pasos**:
1. Subir archivos via FTP/SFTP al directorio `public_html`
2. Configurar dominio en panel de control
3. Aplicar configuraciones de `.htaccess`

## ⚙️ Configuración Post-Deployment

### 1. DNS y Dominio

```bash
# Configurar registros DNS
A     @     [IP-del-servidor]
CNAME www   empacame.com
```

### 2. SSL/HTTPS

- **Netlify/Vercel**: Automático
- **Hosting tradicional**: Activar Let's Encrypt o certificado pagado

### 3. CDN (Opcional)

Para mejor performance:
- Cloudflare (gratis)
- AWS CloudFront
- MaxCDN

## 🔧 Optimizaciones Pre-Deploy

### 1. Minificar Assets

```bash
# CSS
npx clean-css-cli assets/css/style.css -o assets/css/style.min.css

# JavaScript
npx terser assets/js/main.js -o assets/js/main.min.js

# Actualizar referencias en index.html
```

### 2. Comprimir Imágenes

```bash
# Instalar imagemin (opcional)
npm install -g imagemin-cli imagemin-mozjpeg imagemin-pngquant

# Comprimir
imagemin assets/images/*.{jpg,png} --out-dir=assets/images/compressed/
```

### 3. Generar Favicons

Herramientas recomendadas:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

## 📊 Configurar Analytics

### Google Analytics 4

1. Crear cuenta en [analytics.google.com](https://analytics.google.com)
2. Obtener Measurement ID (G-XXXXXXXXXX)
3. Agregar código antes del `</head>`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Facebook Pixel (Opcional)

```html
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'TU_PIXEL_ID');
fbq('track', 'PageView');
</script>
```

## 🔍 SEO Post-Deployment

### 1. Google Search Console

1. Ir a [search.google.com/search-console](https://search.google.com/search-console)
2. Agregar propiedad con tu dominio
3. Verificar propiedad
4. Enviar sitemap: `https://tudominio.com/sitemap.xml`

### 2. Bing Webmaster Tools

1. Ir a [webmaster.bing.com](https://www.bing.com/webmasters)
2. Importar sitio desde Google Search Console
3. Verificar y enviar sitemap

## 📧 Configurar Formularios

### Netlify Forms (Gratis)

Agregar `netlify` al form:
```html
<form name="contact" method="POST" data-netlify="true">
```

### Formspree (Freemium)

```html
<form action="https://formspree.io/f/tu-form-id" method="POST">
```

### EmailJS (Gratis)

Para envío directo desde JavaScript sin backend.

## 🚀 Checklist de Deploy

- [ ] Información de contacto actualizada
- [ ] Analytics configurado
- [ ] Imágenes optimizadas
- [ ] CSS y JS minificados
- [ ] Favicon agregado
- [ ] Meta tags verificados
- [ ] SSL habilitado
- [ ] Sitemap enviado a Google
- [ ] Formularios funcionando
- [ ] Velocidad de carga verificada
- [ ] Responsividad en móviles
- [ ] Enlaces de WhatsApp funcionando

## 🔧 Herramientas de Testing

### Performance
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

### SEO
- [Google Search Console](https://search.google.com/search-console)
- [SEMrush](https://semrush.com/) (pagado)
- [Screaming Frog](https://www.screamingfrog.co.uk/) (freemium)

### Accesibilidad
- [WAVE](https://wave.webaim.org/)
- [aXe DevTools](https://www.deque.com/axe/devtools/)

## 📱 Testing en Dispositivos

### Responsive Testing
- Chrome DevTools
- [BrowserStack](https://www.browserstack.com/) (pagado)
- [LambdaTest](https://www.lambdatest.com/) (freemium)

## 🔄 Mantenimiento Post-Deploy

### 1. Monitoreo Regular
- Uptime monitoring (UptimeRobot, Pingdom)
- Analytics mensuales
- Velocidad de carga
- Formularios funcionando

### 2. Actualizaciones
- Contenido regular
- Precios actualizados
- Nuevos testimonios
- Optimizaciones continuas

### 3. Backups
- Backup automático del hosting
- Copia local del código
- Documentación actualizada

## 🆘 Solución de Problemas

### Problemas Comunes

**1. Formulario no funciona**
- Verificar action del form
- Confirmar configuración del servicio
- Revisar JavaScript

**2. Imágenes no cargan**
- Verificar rutas relativas
- Confirmar nombres de archivos
- Revisar permisos de carpetas

**3. CSS/JS no se aplica**
- Limpiar cache del navegador
- Verificar rutas de archivos
- Confirmar minificación correcta

**4. Lentitud del sitio**
- Comprimir imágenes más
- Habilitar compresión GZIP
- Usar CDN

## 📞 Soporte Técnico

Para problemas específicos del deployment:
- Email: soporte@empacame.com
- WhatsApp: +1 (849) 449-6394
- Documentación: Ver README.md

---

**¡Tu landing page está lista para conquistar el mercado dominicano! 🇩🇴**

*Última actualización: Junio 2025*
