import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import aiConfig from '../config/ai';
import { logger } from '../utils/logger';

const resumeParseSchema = z.object({
  resumeText: z.string().min(10, 'Resume text is too short'),
});

const eventAnnouncementSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  date: z.string(),
  location: z.string(),
});

const teamMatchSchema = z.object({
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

/**
 * Simulate AI call (replace with real API calls in production).
 * In production, integrate with Gemini or Claude API.
 */
async function callAI(prompt: string): Promise<string> {
  if (!aiConfig.isConfigured) {
    logger.warn('AI API not configured — returning mock response');
    return `[AI Mock Response] Processed prompt: "${prompt.substring(0, 100)}..."`;
  }

  // TODO: Implement real AI API call based on aiConfig.provider
  // Example for Gemini:
  //   const response = await fetch(`https://generativelanguage.googleapis.com/...`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  //   });
  //   const data = await response.json();
  //   return data.candidates[0].content.parts[0].text;

  return `[AI Response] Processed prompt successfully`;
}

/**
 * POST /ai/parse-resume — Parse resume text with AI
 */
export async function parseResume(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { resumeText } = resumeParseSchema.parse(req.body);
    const userId = req.user!.id;

    const prompt = `Extract the following from this resume and return as JSON:
- skills (array of strings)
- projects (array of objects with name, description, technologies)
- experience (string: beginner/intermediate/advanced)
- preferredRole (string)

Resume:
${resumeText}`;

    const aiResponse = await callAI(prompt);

    // In production, parse the AI JSON response
    // Mock extracted data for now
    const extractedData = {
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      projects: [
        {
          name: 'Sample Project',
          description: 'Extracted from resume',
          technologies: ['React', 'Node.js'],
        },
      ],
      experience: 'intermediate',
      preferredRole: 'Full Stack Developer',
    };

    // Save extracted skills to database
    const existingSkills = await prisma.skill.findMany({
      where: { userId },
      select: { name: true },
    });
    const existingNames = new Set(
      existingSkills.map((s: { name: string }) => s.name.toLowerCase())
    );
    const newSkills = extractedData.skills.filter(
      (s: string) => !existingNames.has(s.toLowerCase())
    );

    if (newSkills.length > 0) {
      await prisma.skill.createMany({
        data: newSkills.map((name: string) => ({ name, userId })),
      });
    }

    res.json({
      success: true,
      data: {
        extractedData,
        savedSkills: newSkills.length,
        aiRawResponse: aiResponse,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /ai/event-announcement — Generate event announcement using AI
 */
export async function generateEventAnnouncement(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const eventData = eventAnnouncementSchema.parse(req.body);

    const prompt = `Generate an engaging event announcement for a college campus event:
Title: ${eventData.title}
Description: ${eventData.description}
Date: ${eventData.date}
Location: ${eventData.location}

Make it exciting and appealing to engineering students. Include emojis and a catchy opening line.`;

    const announcement = await callAI(prompt);

    // Mock announcement for when AI is not configured
    const mockAnnouncement = `🚀 ${eventData.title} is HERE! 🎉\n\n${eventData.description}\n\n📅 ${eventData.date}\n📍 ${eventData.location}\n\nDon't miss out — register now and be part of something amazing! 💪`;

    res.json({
      success: true,
      data: {
        announcement: aiConfig.isConfigured ? announcement : mockAnnouncement,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /ai/team-match — Get AI-powered team recommendations
 */
export async function getTeamRecommendations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { skills } = teamMatchSchema.parse(req.body);
    const { id: userId, collegeId } = req.user!;

    // Get all users from same college with their skills
    const candidates = await prisma.user.findMany({
      where: {
        collegeId,
        id: { not: userId },
        banned: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        skills: { select: { name: true } },
      },
    });

    // Simple matching algorithm
    const recommendations = candidates
      .map((candidate: { id: string; name: string; email: string; skills: { name: string }[] }) => {
        const candidateSkills = candidate.skills.map((s: { name: string }) => s.name.toLowerCase());
        const userSkillsLower = skills.map((s: string) => s.toLowerCase());

        // Shared skills = skills both have
        const shared = userSkillsLower.filter((s: string) => candidateSkills.includes(s));
        // Complementary = skills candidate has that user doesn't
        const complementary = candidateSkills.filter(
          (s: string) => !userSkillsLower.includes(s)
        );

        const matchScore = shared.length * 10 + complementary.length * 15;

        return {
          userId: candidate.id,
          name: candidate.name,
          email: candidate.email,
          skills: candidate.skills.map((s: { name: string }) => s.name),
          matchScore,
          sharedSkills: shared,
          complementarySkills: complementary,
        };
      })
      .filter((r: { matchScore: number }) => r.matchScore > 0)
      .sort((a: { matchScore: number }, b: { matchScore: number }) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
}
