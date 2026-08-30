import { NextResponse } from 'next/server';

export const INDIAN_MEALS: Record<string, Meal[]> = {
  Breakfast: [
    { id: 'b1', name: 'Poha with Peanuts', calories: 250, protein: 6, carbs: 42, fat: 8, time: '8:00 AM', image: '🍚' },
    { id: 'b2', name: 'Vegetable Upma', calories: 220, protein: 5, carbs: 38, fat: 6, time: '8:00 AM', image: '🥘' },
    { id: 'b3', name: 'Idli Sambar', calories: 280, protein: 8, carbs: 45, fat: 5, time: '8:00 AM', image: '🫓' },
    { id: 'b4', name: 'Moong Dal Chilla', calories: 200, protein: 12, carbs: 28, fat: 6, time: '8:00 AM', image: '🥞' },
    { id: 'b5', name: 'Masala Oats', calories: 180, protein: 7, carbs: 30, fat: 4, time: '8:00 AM', image: '🥣' },
    { id: 'b6', name: 'Besan Chilla with Curd', calories: 260, protein: 10, carbs: 35, fat: 8, time: '8:00 AM', image: '🍳' },
    { id: 'b7', name: 'Stuffed Paratha with Curd', calories: 320, protein: 9, carbs: 48, fat: 10, time: '8:00 AM', image: '🫓' },
    { id: 'b8', name: 'Poha with Sprouts', calories: 230, protein: 9, carbs: 38, fat: 5, time: '8:00 AM', image: '🥗' },
    { id: 'b9', name: 'Egg Bhurji with Toast', calories: 300, protein: 16, carbs: 32, fat: 12, time: '8:00 AM', image: '🥚' },
    { id: 'b10', name: 'Ragi Dosa with Coconut Chutney', calories: 240, protein: 8, carbs: 40, fat: 6, time: '8:00 AM', image: '🥞' },
  ],
  Lunch: [
    { id: 'l1', name: 'Dal Rice with Sabzi', calories: 420, protein: 14, carbs: 68, fat: 10, time: '1:00 PM', image: '🍛' },
    { id: 'l2', name: 'Chapati with Paneer Curry', calories: 450, protein: 18, carbs: 55, fat: 16, time: '1:00 PM', image: '🫓' },
    { id: 'l3', name: 'Rajma Chawal', calories: 480, protein: 16, carbs: 72, fat: 8, time: '1:00 PM', image: '🍛' },
    { id: 'l4', name: 'Sambar Rice', calories: 380, protein: 12, carbs: 62, fat: 8, time: '1:00 PM', image: '🍚' },
    { id: 'l5', name: 'Chicken Curry with Rice', calories: 520, protein: 28, carbs: 58, fat: 16, time: '1:00 PM', image: '🍗' },
    { id: 'l6', name: 'Vegetable Biryani with Raita', calories: 460, protein: 12, carbs: 65, fat: 14, time: '1:00 PM', image: '🍚' },
    { id: 'l7', name: 'Chole Bhature', calories: 550, protein: 14, carbs: 70, fat: 20, time: '1:00 PM', image: '🫓' },
    { id: 'l8', name: 'Fish Curry with Rice', calories: 480, protein: 26, carbs: 55, fat: 14, time: '1:00 PM', image: '🐟' },
    { id: 'l9', name: 'Dal Makhani with Naan', calories: 500, protein: 16, carbs: 62, fat: 18, time: '1:00 PM', image: '🫓' },
    { id: 'l10', name: 'Egg Curry with Chapati', calories: 400, protein: 18, carbs: 50, fat: 14, time: '1:00 PM', image: '🥚' },
  ],
  Snack: [
    { id: 's1', name: 'Sprouts Chaat', calories: 150, protein: 8, carbs: 22, fat: 3, time: '4:00 PM', image: '🥗' },
    { id: 's2', name: 'Roasted Makhana', calories: 120, protein: 4, carbs: 18, fat: 4, time: '4:00 PM', image: '🥜' },
    { id: 's3', name: 'Fruit Bowl', calories: 100, protein: 1, carbs: 24, fat: 0, time: '4:00 PM', image: '🍎' },
    { id: 's4', name: 'Namkeen with Chai', calories: 180, protein: 3, carbs: 28, fat: 7, time: '4:00 PM', image: '☕' },
    { id: 's5', name: 'Greek Yogurt with Honey', calories: 160, protein: 10, carbs: 20, fat: 4, time: '4:00 PM', image: '🍯' },
    { id: 's6', name: 'Murukku (2 pieces)', calories: 140, protein: 2, carbs: 22, fat: 5, time: '4:00 PM', image: '🍘' },
    { id: 's7', name: 'Banana Smoothie', calories: 170, protein: 6, carbs: 32, fat: 2, time: '4:00 PM', image: '🍌' },
    { id: 's8', name: 'Masala Corn', calories: 130, protein: 4, carbs: 24, fat: 2, time: '4:00 PM', image: '🌽' },
  ],
  Dinner: [
    { id: 'd1', name: 'Chapati with Dal Fry', calories: 350, protein: 12, carbs: 52, fat: 10, time: '8:00 PM', image: '🫓' },
    { id: 'd2', name: 'Vegetable Khichdi', calories: 300, protein: 10, carbs: 50, fat: 6, time: '8:00 PM', image: '🍚' },
    { id: 'd3', name: 'Grilled Chicken with Salad', calories: 380, protein: 30, carbs: 15, fat: 18, time: '8:00 PM', image: '🥗' },
    { id: 'd4', name: 'Paneer Tikka with Roti', calories: 400, protein: 20, carbs: 45, fat: 14, time: '8:00 PM', image: '🫓' },
    { id: 'd5', name: 'Vegetable Soup with Bread', calories: 250, protein: 6, carbs: 38, fat: 6, time: '8:00 PM', image: '🍲' },
    { id: 'd6', name: 'Egg Curry with Rice', calories: 420, protein: 16, carbs: 55, fat: 14, time: '8:00 PM', image: '🥚' },
    { id: 'd7', name: 'Dal Tadka with Jeera Rice', calories: 360, protein: 12, carbs: 56, fat: 8, time: '8:00 PM', image: '🍛' },
    { id: 'd8', name: 'Butter Chicken with Naan', calories: 500, protein: 24, carbs: 48, fat: 22, time: '8:00 PM', image: '🍗' },
  ],
};

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  image: string;
}

export async function GET() {
  return NextResponse.json({ meals: INDIAN_MEALS });
}
