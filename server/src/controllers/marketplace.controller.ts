import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  price: z.number().positive(),
  images: z.array(z.string().url()).optional().default([]),
});

/**
 * POST /marketplace — Create a marketplace listing
 */
export async function createListing(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = createListingSchema.parse(req.body);
    const { id: userId, collegeId } = req.user!;

    const listing = await prisma.marketplaceListing.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        images: data.images,
        sellerId: userId,
        collegeId,
      },
      include: {
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /marketplace — List active listings for user's college
 */
export async function getListings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { collegeId } = req.user!;

    const listings = await prisma.marketplaceListing.findMany({
      where: { collegeId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, data: listings });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /marketplace/:id — Get listing details
 */
export async function getListingById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { collegeId } = req.user!;

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    if (!listing) throw AppError.notFound('Listing');
    if (listing.collegeId !== collegeId) throw AppError.forbidden('Access denied');

    res.json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /marketplace/:id/sold — Mark listing as sold
 */
export async function markAsSold(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const listing = await prisma.marketplaceListing.findUnique({ where: { id } });
    if (!listing) throw AppError.notFound('Listing');
    if (listing.sellerId !== userId) throw AppError.forbidden('Only the seller can update this listing');

    const updated = await prisma.marketplaceListing.update({
      where: { id },
      data: { status: 'SOLD' },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}
