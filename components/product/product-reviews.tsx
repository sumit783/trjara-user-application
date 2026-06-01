'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

interface ProductReviewsProps {
  rating: number;
  reviews: Review[];
  showAllReviews: boolean;
  setShowAllReviews: (show: boolean) => void;
}

export function ProductReviews({
  rating,
  reviews,
  showAllReviews,
  setShowAllReviews,
}: ProductReviewsProps) {
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="border-t border-gray-200 px-4 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-foreground leading-tight">
            Customer Reviews
          </h3>
          <p className="text-xs font-semibold text-muted-foreground">
            Based on 128 verified ratings
          </p>
        </div>
        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-black">
          ★ {rating} / 5.0
        </div>
      </div>

      <div className="space-y-4">
        {displayedReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-fade-in"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                  {rev.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-black text-foreground">
                    {rev.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {rev.date}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < rev.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {rev.comment}
            </p>
          </div>
        ))}
      </div>

      {/* Add More / See More Button */}
      <div className="mt-4 text-center">
        <Button
          variant="outline"
          onClick={() => setShowAllReviews(!showAllReviews)}
          className="border-2 border-border text-xs font-black px-6 py-2 h-auto rounded-xl hover:bg-gray-50"
        >
          {showAllReviews ? 'Show Less' : 'See More Reviews (125+)'}
        </Button>
      </div>
    </div>
  );
}
