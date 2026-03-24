import express from 'express';
import Character from '../models/Character.js';
import Relationship from '../models/Relationship.js';

const router = express.Router();

// ── GET /api/export/graph.json ────────────────────────────────────────────────
// Full graph in D3-compatible JSON. Public. No auth required.
// Used by: anyone who wants to build with the dataset.
router.get('/graph.json', async (req, res) => {
  try {
    const [nodes, links] = await Promise.all([
      Character.find({}).select('-__v -createdBy').lean(),
      Relationship.find({}).select('-__v -createdBy').lean(),
    ]);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="devlok-graph.json"');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache 1 hour

    res.json({
      meta: {
        name: 'Devlok — Indian Mythology Knowledge Graph',
        description: 'Complete graph dataset of Hindu mythology — characters, relationships, yugas, and scripture sources.',
        license: 'CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/',
        attribution: 'Devlok (https://devlok.in) — Vibhu, 2026',
        exported_at: new Date().toISOString(),
        node_count: nodes.length,
        edge_count: links.length,
        node_types: ['deva', 'devi', 'hero', 'sage', 'asura', 'celestial', 'avatar'],
        link_types: ['family', 'divine', 'conflict', 'guru', 'alliance', 'manifestation'],
        yuga_values: ['eternal', 'satya', 'treta', 'dvapara', 'kali'],
        filter_values: ['mahabharata', 'ramayana', 'purana', 'vedic'],
      },
      nodes,
      links,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/export/characters.csv ───────────────────────────────────────────
// Characters as CSV. Public. No auth required.
router.get('/characters.csv', async (req, res) => {
  try {
    const characters = await Character.find({}).select('-__v -createdBy -_id').lean();

    const HEADERS = ['id', 'label', 'sanskrit', 'type', 'size', 'filter', 'yuga', 'epithets', 'desc', 'source'];

    const escape = (val) => {
      if (val === undefined || val === null) return '';
      const str = Array.isArray(val) ? val.join(' | ') : String(val);
      // Wrap in quotes and escape internal quotes per RFC 4180
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = characters.map(c =>
      HEADERS.map(h => escape(c[h])).join(',')
    );

    const csv = [HEADERS.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="devlok-characters.csv"');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    // BOM for Excel compatibility with Unicode
    res.send('\uFEFF' + csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/export/relationships.csv ─────────────────────────────────────────
// Relationships as CSV. Public. No auth required.
router.get('/relationships.csv', async (req, res) => {
  try {
    const relationships = await Relationship.find({}).select('-__v -createdBy -_id').lean();

    const HEADERS = ['source', 'target', 'label', 'type'];

    const escape = (val) => {
      if (val === undefined || val === null) return '';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = relationships.map(r =>
      HEADERS.map(h => escape(r[h])).join(',')
    );

    const csv = [HEADERS.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="devlok-relationships.csv"');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send('\uFEFF' + csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
