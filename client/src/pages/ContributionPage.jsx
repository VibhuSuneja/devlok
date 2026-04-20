import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios.js';

const EMPTY_FORMS = {
  correction: { targetId: '', field: 'desc', newValue: '', sourceCitation: '' },
  new_concept: { id: '', label: '', sanskrit: '', desc: '', sourceCitation: '', yuga: 'eternal', filter: 'conceptual', type: 'concept' },
  new_relationship: { source: '', target: '', label: '', type: 'conceptual', sourceCitation: '' },
  new_guided_path: { id: '', title: '', thesis: '', description: '', startNodeId: '', endNodeId: '', citations: '', stepsJson: '[\n  {\n    "nodeId": "",\n    "title": "",\n    "body": ""\n  }\n]', sourceCitation: '' },
};

function ContributionPage() {
  const [kind, setKind] = useState('new_concept');
  const [form, setForm] = useState(EMPTY_FORMS.new_concept);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const helperText = useMemo(() => ({
    correction: 'Suggest a direct correction to an existing entity field.',
    new_concept: 'Propose a new concept or text node for the graph.',
    new_relationship: 'Add a new relationship between existing nodes.',
    new_guided_path: 'Propose a curated learning path with steps and citations.',
  }), []);

  const handleKindChange = (nextKind) => {
    setKind(nextKind);
    setForm(EMPTY_FORMS[nextKind]);
    setStatus({ type: 'idle', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'idle', message: '' });

    try {
      let payload;

      if (kind === 'correction') {
        payload = {
          type: 'correction',
          targetId: form.targetId.trim(),
          sourceCitation: form.sourceCitation.trim(),
          data: {
            field: form.field,
            newValue: form.newValue.trim(),
          },
        };
      } else if (kind === 'new_concept') {
        payload = {
          type: 'new_concept',
          sourceCitation: form.sourceCitation.trim(),
          data: {
            id: form.id.trim(),
            label: form.label.trim(),
            sanskrit: form.sanskrit.trim(),
            desc: form.desc.trim(),
            yuga: form.yuga,
            filter: form.filter,
            type: form.type,
            entityKind: form.type === 'text' ? 'text' : 'concept',
            epithets: [],
          },
        };
      } else if (kind === 'new_relationship') {
        payload = {
          type: 'new_relationship',
          sourceCitation: form.sourceCitation.trim(),
          data: {
            source: form.source.trim(),
            target: form.target.trim(),
            label: form.label.trim(),
            type: form.type,
          },
        };
      } else {
        payload = {
          type: 'new_guided_path',
          sourceCitation: form.sourceCitation.trim(),
          data: {
            id: form.id.trim(),
            title: form.title.trim(),
            thesis: form.thesis.trim(),
            description: form.description.trim(),
            startNodeId: form.startNodeId.trim(),
            endNodeId: form.endNodeId.trim(),
            citations: form.citations.split('\n').map((entry) => entry.trim()).filter(Boolean),
            steps: JSON.parse(form.stepsJson),
          },
        };
      }

      await axios.post('/submissions', payload);
      setStatus({ type: 'success', message: 'Contribution submitted. You received +50 Shraddha immediately; approved work grants +200 more.' });
      setForm(EMPTY_FORMS[kind]);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Submission failed. Check the payload and source citation.' });
    }
  };

  return (
    <div className="login-page">
      <div className="login-card contribution-card">
        <h2 className="login-title">Contribute to Devlok</h2>
        <p className="login-sub">{helperText[kind]}</p>

        <div className="contribution-tabs">
          {Object.keys(helperText).map((option) => (
            <button
              key={option}
              type="button"
              className={`filter-btn ${kind === option ? 'active' : ''}`}
              onClick={() => handleKindChange(option)}
            >
              {option.replaceAll('_', ' ')}
            </button>
          ))}
        </div>

        <form className="contribution-form" onSubmit={handleSubmit}>
          {kind === 'correction' && (
            <>
              <input value={form.targetId} onChange={(e) => setForm({ ...form, targetId: e.target.value })} placeholder="Target node id" required />
              <select value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })}>
                <option value="desc">Description</option>
                <option value="source">Source</option>
                <option value="sanskrit">Sanskrit</option>
              </select>
              <textarea value={form.newValue} onChange={(e) => setForm({ ...form, newValue: e.target.value })} rows={4} placeholder="Proposed corrected text" required />
            </>
          )}

          {kind === 'new_concept' && (
            <>
              <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="Node id" required />
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label" required />
              <input value={form.sanskrit} onChange={(e) => setForm({ ...form, sanskrit: e.target.value })} placeholder="Sanskrit label" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, filter: e.target.value === 'text' ? 'textual' : 'conceptual' })}>
                <option value="concept">Concept node</option>
                <option value="text">Text node</option>
                <option value="darshana">Darshana node</option>
              </select>
              <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={5} placeholder="Meaning, scope, and why this belongs in the graph" required />
            </>
          )}

          {kind === 'new_relationship' && (
            <>
              <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Source node id" required />
              <input value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder="Target node id" required />
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Relationship label" required />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="conceptual">Conceptual</option>
                <option value="textual">Textual</option>
                <option value="divine">Divine</option>
                <option value="alliance">Alliance</option>
                <option value="conflict">Conflict</option>
              </select>
            </>
          )}

          {kind === 'new_guided_path' && (
            <>
              <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="Path id" required />
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Path title" required />
              <textarea value={form.thesis} onChange={(e) => setForm({ ...form, thesis: e.target.value })} rows={3} placeholder="One-sentence argument for the path" required />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Short path description" />
              <input value={form.startNodeId} onChange={(e) => setForm({ ...form, startNodeId: e.target.value })} placeholder="Start node id" required />
              <input value={form.endNodeId} onChange={(e) => setForm({ ...form, endNodeId: e.target.value })} placeholder="End node id" required />
              <textarea value={form.citations} onChange={(e) => setForm({ ...form, citations: e.target.value })} rows={3} placeholder="One citation per line" />
              <textarea value={form.stepsJson} onChange={(e) => setForm({ ...form, stepsJson: e.target.value })} rows={10} placeholder="JSON array of steps" required />
            </>
          )}

          <input value={form.sourceCitation} onChange={(e) => setForm({ ...form, sourceCitation: e.target.value })} placeholder="Primary source citation" required />

          {status.type !== 'idle' && (
            <div className={`contribution-status contribution-status--${status.type}`}>
              {status.message}
            </div>
          )}

          <button className="btn btn-primary" type="submit">Submit Contribution</button>
        </form>

        <Link to="/" className="login-back" style={{ display: 'block', textAlign: 'center', marginTop: '30px' }}>
          ← Return to the Map
        </Link>
      </div>
    </div>
  );
}

export default ContributionPage;
