// client/src/api/soul.js
// All API calls for the Soul Profile Engine

import api from './axios.js';

/** POST /api/soul/onboard */
export const onboardSoul = (answers, lifePhase) =>
  api.post('/soul/onboard', { answers, lifePhase });

/** GET /api/soul/profile */
export const getSoulProfile = () =>
  api.get('/soul/profile');

/** GET /api/soul/question/today */
export const getTodayQuestion = () =>
  api.get('/soul/question/today');

/** POST /api/soul/reflect */
export const submitReflection = (questionId, answerText) =>
  api.post('/soul/reflect', { questionId, answerText });

/** GET /api/soul/reflect/:reflectionId/interpretation */
export const getInterpretation = (reflectionId) =>
  api.get(`/soul/reflect/${reflectionId}/interpretation`);

/** PUT /api/soul/phase */
export const updatePhase = (newPhaseKey, resolvedPrevious = false) =>
  api.put('/soul/phase', { newPhaseKey, resolvedPrevious });

/** GET /api/soul/card */
export const getSoulCard = () =>
  api.get('/soul/card');

/** GET /api/soul/reflections */
export const getReflectionHistory = (page = 1) =>
  api.get(`/soul/reflections?page=${page}&limit=10`);
