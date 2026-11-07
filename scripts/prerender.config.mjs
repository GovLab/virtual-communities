// Site settings for scripts/prerender.mjs: which pages to pre-render, which Vue
// data each one is seeded with, its head tags and JSON-LD, and its Markdown copy.
const ORIGIN = 'https://virtual-communities.thegovlab.org';
const SITE = 'The Power of Virtual Communities';
const ASSETS = 'https://burnes-center.directus.app/assets/';
const INTRO = 'The Power of Virtual Communities project examines the role online groups play in creating opportunities for people to build new kinds of meaningful communities they often could not form in real space.';

const publisher = { '@type': 'Organization', '@id': 'https://thegovlab.org/#organization', name: 'The GovLab', url: 'https://thegovlab.org' };
const website = { '@type': 'WebSite', '@id': `${ORIGIN}/#website`, name: SITE, url: `${ORIGIN}/`, publisher: { '@id': publisher['@id'] }, inLanguage: 'en' };
const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': [website, publisher, ...nodes] });
const crumbs = (...items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
});
const fullName = (t) => `${(t.first_name || '').trim()} ${(t.last_name || '').trim()}`.trim();
// "February 23, 2021" or "2021-02-19T00:00:00" -> "2021-02-23"
const isoDate = (text) => {
  if (!text) return undefined;
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? undefined
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
// The literature review opens with an editorial note; the summary starts after it.
const litText = (html) => String(html || '').replace(/^\s*<p>\s*<em>[\s\S]*?<\/em>\s*<\/p>/i, '').replace(/^\s*<h\d[^>]*>[\s\S]*?<\/h\d>/i, '');
// The executive summary starts with its own "Executive Summary" heading.
const execText = (html) => String(html || '').replace(/^\s*<p>\s*<strong>\s*Executive Summary\s*<\/strong>\s*<\/p>/i, '');
const section = (heading, body) => (body ? `## ${heading}\n\n${body}` : '');
const join = (...parts) => parts.filter(Boolean).join('\n\n');

export default {
  origin: ORIGIN,
  siteName: SITE,
  siteId: 'virtual-communities',
  source: 'The GovLab (virtual-communities.thegovlab.org)',
  licence: 'Creative Commons Attribution-ShareAlike 4.0 International License (http://creativecommons.org/licenses/by-sa/4.0/)',
  llmsIntro: `${INTRO} The GovLab interviewed leaders of online groups from around the world in 2020; this site publishes the resulting case studies, a literature review, an executive summary and the full report. Text licensed CC BY-SA 4.0.`,
  twitterSite: '@thegovlab',
  directus: 'https://burnes-center.directus.app/',

  async pages({ directus, summary, canonicalUrl, md }) {
    const cases = await directus('vc_case_study', { 'filter[status][_eq]': 'published', fields: 'slug', limit: '-1', sort: 'id' });
    const caseList = (state) => (state.filterData || []).map((c, i) => ({
      '@type': 'ListItem', position: i + 1, url: canonicalUrl(`/case/${c.slug}`), name: c.title,
    }));
    const about = (state) => (state.aboutData && state.aboutData[0] ? summary(state.aboutData[0].about_the_project, 300) : INTRO);

    const single = [
      {
        path: '/', file: 'index.html', inPlace: true, seed: ['indexData', 'aboutData'], ready: ['indexData', 'aboutData'],
        head: (s) => ({
          title: SITE,
          description: INTRO,
          jsonld: graph({
            '@type': 'CollectionPage', '@id': `${ORIGIN}/#page`, name: `${SITE}: case studies`, url: `${ORIGIN}/`,
            description: about(s), isPartOf: { '@id': website['@id'] }, publisher: { '@id': publisher['@id'] },
            mainEntity: { '@type': 'ItemList', name: 'Case studies', itemListElement: caseList(s) },
          }),
        }),
        markdown: (s) => ({
          type: 'GovLab project overview',
          title: SITE,
          summary: INTRO,
          body: join(
            md(s.aboutData[0] && s.aboutData[0].about_the_project),
            section('Case studies', s.filterData.map((c) => `- [${c.title}](${canonicalUrl(`/case/${c.slug}`)}): ${c.headline}. ` +
              [c.location, c.founding_year && `founded ${c.founding_year}`, c.number_of_members && `group size ${c.number_of_members}`].filter(Boolean).join('; ')).join('\n')),
          ),
        }),
      },
      {
        path: '/executive-summary', file: 'executive-summary.html', inPlace: true, seed: ['exec_summary', 'aboutData'],
        head: (s) => ({
          title: `Executive Summary | ${SITE}`,
          description: summary(execText(s.exec_summary[0].summary_text)),
          ogType: 'article',
          jsonld: graph({
            '@type': 'Report', name: `${SITE}: Executive Summary`, url: canonicalUrl('/executive-summary'),
            description: summary(execText(s.exec_summary[0].summary_text), 300), inLanguage: 'en',
            author: { '@id': publisher['@id'] }, publisher: { '@id': publisher['@id'] }, isPartOf: { '@id': website['@id'] },
          }, crumbs([SITE, `${ORIGIN}/`], ['Executive Summary', canonicalUrl('/executive-summary')])),
        }),
        markdown: (s) => ({
          type: 'GovLab report executive summary',
          title: `${SITE}: Executive Summary`,
          summary: summary(execText(s.exec_summary[0].summary_text), 300),
          body: md(s.exec_summary[0].summary_text),
        }),
      },
      {
        path: '/literature-review/', file: 'literature-review/index.html', inPlace: true, seed: ['indexData', 'aboutData'],
        head: (s) => ({
          title: `Literature Review | ${SITE}`,
          description: summary(litText(s.indexData[0].text_body)),
          ogType: 'article',
          jsonld: graph({
            '@type': 'ScholarlyArticle', headline: `${SITE}: Literature Review`, url: canonicalUrl('/literature-review/'),
            description: summary(litText(s.indexData[0].text_body), 300), datePublished: isoDate(s.indexData[0].date), inLanguage: 'en',
            author: { '@id': publisher['@id'] }, publisher: { '@id': publisher['@id'] }, isPartOf: { '@id': website['@id'] },
          }, crumbs([SITE, `${ORIGIN}/`], ['Literature Review', canonicalUrl('/literature-review/')])),
        }),
        markdown: (s) => ({
          type: 'GovLab literature review',
          title: `${SITE}: Literature Review`,
          date: isoDate(s.indexData[0].date),
          summary: summary(litText(s.indexData[0].text_body), 300),
          body: join(md(s.indexData[0].text_body), section('Bibliography', md(s.indexData[0].bibliography)), section('End notes', md(s.indexData[0].end_notes))),
        }),
      },
      {
        path: '/reports', file: 'reports.html', inPlace: true, seed: ['reportData', 'aboutData'],
        head: (s) => ({
          title: `Download the Report | ${SITE}`,
          description: `Download the report ${SITE} in ${s.reportData.map((r) => r.language).join(', ')}.`,
          jsonld: graph({
            '@type': 'CollectionPage', name: `${SITE}: reports`, url: canonicalUrl('/reports'), isPartOf: { '@id': website['@id'] },
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: s.reportData.map((r, i) => ({
                '@type': 'ListItem', position: i + 1,
                item: {
                  '@type': 'Report', name: r.title, inLanguage: r.language, encodingFormat: 'application/pdf',
                  url: `${ORIGIN}/files/${r.link}`, image: r.thumbnail ? ASSETS + r.thumbnail.id : undefined, publisher: { '@id': publisher['@id'] },
                },
              })),
            },
          }, crumbs([SITE, `${ORIGIN}/`], ['Download the Report', canonicalUrl('/reports')])),
        }),
        markdown: (s) => ({
          type: 'GovLab report downloads',
          title: `${SITE}: Download the Report`,
          summary: `The full report as PDF in ${s.reportData.map((r) => r.language).join(', ')}.`,
          body: join(
            md(s.aboutData[0] && s.aboutData[0].about_the_project),
            section('Reports', s.reportData.map((r) => `- [${r.title} (${r.language}, PDF)](${ORIGIN}/files/${encodeURI(r.link)})`).join('\n')),
          ),
        }),
      },
      {
        path: '/team', file: 'team.html', inPlace: true, seed: ['teamData'],
        head: (s) => ({
          title: `Team | ${SITE}`,
          description: `The authors and advisors of ${SITE}: ${s.teamData.map(fullName).join(', ')}.`,
          jsonld: graph({
            '@type': 'AboutPage', name: `${SITE}: team`, url: canonicalUrl('/team'), isPartOf: { '@id': website['@id'] },
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: s.teamData.map((t, i) => ({
                '@type': 'ListItem', position: i + 1,
                item: { '@type': 'Person', name: fullName(t), jobTitle: t.affiliation || undefined, description: t.short_bio || undefined },
              })),
            },
          }, crumbs([SITE, `${ORIGIN}/`], ['Team', canonicalUrl('/team')])),
        }),
        markdown: (s) => ({
          type: 'GovLab project team',
          title: `${SITE}: Team`,
          summary: `The authors and advisors of ${SITE}.`,
          body: s.teamData.map((t) => join(
            `## ${fullName(t)}`,
            [t.affiliation, t.role ? 'Project Advisor' : 'Report Author'].filter(Boolean).join('. ') + '.',
            md(t.full_bio) || t.short_bio,
          )).join('\n\n'),
        }),
      },
    ];

    const detail = cases.map(({ slug }) => ({
      path: `/case/${slug}`, file: `case/${slug}.html`, template: 'case/index.html', seed: ['indexData'],
      lastmodFrom: (s) => s.indexData[0].latest_update,
      head: (s) => {
        const c = s.indexData[0];
        const url = canonicalUrl(`/case/${slug}`);
        const image = c.featured_image ? ASSETS + c.featured_image.id : undefined;
        return {
          title: `${c.title} | ${SITE}`,
          description: c.headline ? `${c.title}: ${c.headline}. A case study from ${SITE}.` : summary(c.case_study_body),
          image,
          ogType: 'article',
          jsonld: graph({
            '@type': 'Article', '@id': `${url}#article`, headline: c.title, alternativeHeadline: c.headline || undefined,
            description: summary(c.case_study_body, 300), url, mainEntityOfPage: url, image, inLanguage: 'en',
            articleSection: 'Case study', dateModified: isoDate(c.latest_update),
            author: { '@id': publisher['@id'] }, publisher: { '@id': publisher['@id'] }, isPartOf: { '@id': website['@id'] },
            about: {
              '@type': 'Organization', name: c.title, foundingDate: c.founding_year || undefined,
              location: c.location ? { '@type': 'Place', name: c.location } : undefined,
            },
          }, crumbs([SITE, `${ORIGIN}/`], [c.title, url])),
        };
      },
      markdown: (s) => {
        const c = s.indexData[0];
        return {
          type: 'GovLab case study',
          title: c.title,
          date: isoDate(c.latest_update),
          summary: c.headline,
          body: join(
            c.headline ? `**${c.headline}**` : '',
            [
              c.founding_year && `- Founding year: ${c.founding_year}`,
              c.number_of_members && `- Group size: ${c.number_of_members}`,
              c.location && `- Location: ${c.location}`,
              `- Part of: [${SITE}](${ORIGIN}/)`,
            ].filter(Boolean).join('\n'),
            md(c.case_study_body),
            section('Lessons learned', md(c.lessons_learned)),
            section('End notes', md(c.end_notes)),
          ),
        };
      },
    }));

    return [...single, ...detail];
  },
};
