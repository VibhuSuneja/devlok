// d:\mythology\devlok\server\scratch\integration_test.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import SoulProfile from '../models/SoulProfile.js';
import Reflection from '../models/Reflection.js';
import { computeDimensionsFromAnswers } from '../constants/onboardingQuestions.js';

dotenv.config();

async function runTest() {
  console.log("🕉️ Starting Integration Test...");
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // 1. Setup Test User
    const testClerkId = "user_test_soul_engine_123";
    let user = await User.findOne({ clerkId: testClerkId });
    
    if (user) {
      console.log("Cleaning up previous test profile...");
      await SoulProfile.deleteMany({ userId: user._id });
      await Reflection.deleteMany({ userId: user._id });
      user.hasSoulProfile = false;
      user.soulProfileId = null;
      await user.save();
    } else {
      console.log("Creating new test user...");
      user = await User.create({
        name: "Test Seeker",
        email: "seeker@test.com",
        clerkId: testClerkId,
        hasSoulProfile: false
      });
    }

    console.log(`Test User ID: ${user._id}`);

    // 2. Simulate Onboarding
    console.log("\n--- Simulating Onboarding ---");
    const mockAnswers = [
      { questionId: "Q1", optionId: "Q1C" }, // Action+15
      { questionId: "Q3", optionId: "Q3D" }, // Action+15
      { questionId: "Q5", optionId: "Q5D" }  // Dharma+20
    ];
    
    const initialDimensions = computeDimensionsFromAnswers(mockAnswers);
    const chosenPhase = "CAREER_CONFUSION";

    // Call internal logic (since we aren't running the HTTP server yet)
    const { computeArchetypeMatch, ARCHETYPES } = await import('../constants/archetypes.js');
    const { LIFE_PHASES } = await import('../constants/lifePhases.js');
    const matchResult = computeArchetypeMatch(initialDimensions);
    const arch = ARCHETYPES[matchResult.archetypeKey];
    const phase = LIFE_PHASES[chosenPhase];

    const soulProfile = await SoulProfile.create({
      userId: user._id,
      primaryArchetype: {
        name: arch.name,
        assignedAt: new Date(),
        coreWound: arch.coreWound,
        emergingStrength: arch.emergingStrength,
        mythText: arch.tagline
      },
      currentPhase: {
        phaseKey: chosenPhase,
        phaseLabel: phase.label,
        enteredAt: new Date()
      },
      streak: {
        current: 1,
        lastReflectedAt: new Date()
      },
      dimensions: initialDimensions
    });

    user.hasSoulProfile = true;
    user.soulProfileId = soulProfile._id;
    user.onboardingCompletedAt = new Date();
    await user.save();

    console.log("Soul Profile Created:", soulProfile.primaryArchetype.name);
    console.log("Initial Streak:", soulProfile.streak.current);

    // 3. Simulate Reflection Submission
    console.log("\n--- Simulating Reflection Submission ---");
    const { getNextQuestion } = await import('../constants/reflectionQuestions.js');
    const nextQ = getNextQuestion(chosenPhase, []);

    const reflection = await Reflection.create({
      userId: user._id,
      soulProfileId: soulProfile._id,
      question: {
        text: nextQ.text,
        phaseRef: chosenPhase,
        dimensionTarget: nextQ.dimensionTarget
      },
      answer: {
        text: "I feel like I'm doing a lot of work but it's not leading anywhere.",
        wordCount: 15
      },
      interpretation: null
    });

    console.log("Reflection Saved:", reflection._id);

    // 4. Verify DB State
    const updatedUser = await User.findById(user._id).populate('soulProfileId');
    console.log("\n--- Database Verification ---");
    console.log("User hasSoulProfile:", updatedUser.hasSoulProfile);
    console.log("SoulProfile ID in User:", updatedUser.soulProfileId?._id);
    console.log("Current Phase in Profile:", updatedUser.soulProfileId?.currentPhase.phaseKey);
    console.log("Final Streak:", updatedUser.soulProfileId?.streak.current);

    console.log("\n✅ Integration test internal logic passed.");
    process.exit(0);
  } catch (err) {
    console.error("Test Failed:", err);
    process.exit(1);
  }
}

runTest();
