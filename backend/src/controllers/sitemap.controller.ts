import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Generate dynamic sitemap.xml with static pages + all active professional booking pages
 */
export const getSitemap = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all active, non-suspended professionals with their slugs
    const professionals = await prisma.professional.findMany({
      where: {
        isActive: true,
        isSuspended: false,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const today = new Date().toISOString().split('T')[0];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    xml += `  <url>\n    <loc>https://agendux.com/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>https://agendux.com/dudas</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>https://agendux.com/privacidad</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.4</priority>\n  </url>\n`;

    // Landing pages
    xml += `  <url>\n    <loc>https://agendux.com/para-psicologos</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>https://agendux.com/para-medicos</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>https://agendux.com/para-peluquerias</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>https://agendux.com/para-consultorios</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

    // Dynamic professional booking pages
    for (const prof of professionals) {
      const lastmod = prof.updatedAt.toISOString().split('T')[0];
      xml += `  <url>\n    <loc>https://agendux.com/${prof.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    xml += '</urlset>\n';

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache 1 hour
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
};
