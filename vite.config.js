import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Custom plugin to inject config data into index.html
const injectConfigPlugin = () => {
  return {
    name: 'inject-config',
    transformIndexHtml(html) {
      try {
        const configPath = path.resolve(__dirname, 'src/data/config.json');
        const configStr = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configStr);
        
        const title = config.siteTitle || 'Wedding';
        const description = `You are invited to the wedding of ${config.hero?.name1} & ${config.hero?.name2}`;
        
        return html
          .replace('<title>wedding Toey&Taii</title>', `<title>${title}</title>`)
          .replace(
            '</head>',
            `
    <!-- Open Graph / Facebook / LINE -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="/main_cover.JPG" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${description}" />
    <meta property="twitter:image" content="/main_cover.JPG" />
    </head>`
          );
      } catch (err) {
        console.error('Error injecting config into index.html:', err);
        return html;
      }
    }
  };
};

// Custom plugin to generate event.ics for Apple Calendar
const generateIcsPlugin = () => {
  return {
    name: 'generate-ics',
    buildStart() {
      try {
        const configPath = path.resolve(__dirname, 'src/data/config.json');
        const configStr = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configStr);
        
        const d = new Date(config.countdown?.targetDate || '2026-12-19T00:00:00');
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        const nd = new Date(d);
        nd.setDate(nd.getDate() + 1);
        const ny = nd.getFullYear();
        const nm = String(nd.getMonth() + 1).padStart(2, '0');
        const nday = String(nd.getDate()).padStart(2, '0');
        
        const title = config.siteTitle || 'Wedding';
        const loc = config.hero?.location || '';
        const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:${y}${m}${day}\nDTEND;VALUE=DATE:${ny}${nm}${nday}\nSUMMARY:${title}\nLOCATION:${loc}\nBEGIN:VALARM\nTRIGGER:-P1W\nACTION:DISPLAY\nDESCRIPTION:Upcoming Wedding!\nEND:VALARM\nEND:VEVENT\nEND:VCALENDAR`;
        
        const publicDir = path.resolve(__dirname, 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir);
        }
        fs.writeFileSync(path.resolve(publicDir, 'event.ics'), icsData);
      } catch (err) {
        console.error('Error generating event.ics:', err);
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/event.ics') {
          try {
            const configPath = path.resolve(__dirname, 'src/data/config.json');
            const configStr = fs.readFileSync(configPath, 'utf-8');
            const config = JSON.parse(configStr);
            
            const d = new Date(config.countdown?.targetDate || '2026-12-19T00:00:00');
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            
            const nd = new Date(d);
            nd.setDate(nd.getDate() + 1);
            const ny = nd.getFullYear();
            const nm = String(nd.getMonth() + 1).padStart(2, '0');
            const nday = String(nd.getDate()).padStart(2, '0');
            
            const title = config.siteTitle || 'Wedding';
            const loc = config.hero?.location || '';
            const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:${y}${m}${day}\nDTEND;VALUE=DATE:${ny}${nm}${nday}\nSUMMARY:${title}\nLOCATION:${loc}\nBEGIN:VALARM\nTRIGGER:-P1W\nACTION:DISPLAY\nDESCRIPTION:Upcoming Wedding!\nEND:VALARM\nEND:VEVENT\nEND:VCALENDAR`;
            
            res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
            // 'inline' tells iOS to view it, rather than download it as a raw file
            res.setHeader('Content-Disposition', 'inline; filename="event.ics"');
            res.end(icsData);
            return;
          } catch (e) {
            console.error(e);
          }
        }
        next();
      });
    }
  };
};

// https://vite.dev/config/
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), injectConfigPlugin(), generateIcsPlugin(), basicSsl()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true
      }
    }
  }
});
