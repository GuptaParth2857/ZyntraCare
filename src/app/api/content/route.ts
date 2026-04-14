import { NextResponse } from 'next/server';

function generateBlogPosts() {
  const posts = [
    { title: 'Heart Health: 10 Essential Tips for a Healthy Heart', category: 'Cardiology', image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800' },
    { title: 'Understanding Diabetes: Prevention and Management', category: 'Diabetes', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800' },
    { title: 'Mental Health Matters: Breaking the Stigma', category: 'Mental Health', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800' },
    { title: 'Brain Wellness: How to Keep Your Mind Sharp', category: 'Neurology', image: 'https://images.unsplash.com/photo-1559757148-5c350e0c9564?w=800' },
    { title: 'Cancer Prevention: Early Detection Saves Lives', category: 'Oncology', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800' },
    { title: 'Bone Health: Preventing Osteoporosis at Any Age', category: 'Orthopedics', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800' },
    { title: 'Respiratory Health: Breathing Easy', category: 'Pulmonology', image: 'https://images.unsplash.com/photo-1584515933487-779824d29609?w=800' },
    { title: 'Pediatric Care: Your Child\'s First Visit to the Doctor', category: 'Pediatrics', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800' },
  ];
  
  return posts.map((post, i) => ({
    id: `blog_${i + 1}`,
    title: post.title,
    excerpt: `Learn about ${post.title.toLowerCase().replace(/.*?: /, '')} and how to stay healthy. Expert advice and latest research.`,
    category: post.category,
    author: 'Dr. ' + ['Amit Sharma', 'Priya Singh', 'Rahul Verma', 'Anjali Gupta'][i % 4],
    date: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    readTime: 5 + Math.floor(Math.random() * 10),
    image: post.image,
    featured: i < 3,
  }));
}

function generateVideos() {
  const videos = [
    { title: 'Understanding Heart Disease: Causes & Prevention', expert: 'Dr. Naresh Trehan', specialty: 'Cardiology', duration: '15:30', views: 45000 },
    { title: 'Managing Diabetes: A Complete Guide', expert: 'Dr. Prashant Kumar', specialty: 'Diabetes', duration: '22:45', views: 38000 },
    { title: 'Mental Health Awareness & Self-Care', expert: 'Dr. Samir Parikh', specialty: 'Psychiatry', duration: '18:20', views: 52000 },
    { title: 'Brain Health: Keeping Your Mind Young', expert: 'Dr. Vinit Suri', specialty: 'Neurology', duration: '25:10', views: 29000 },
    { title: 'Cancer Prevention: What You Need to Know', expert: 'Dr. Ashok Vaid', specialty: 'Oncology', duration: '20:00', views: 41000 },
    { title: 'Bone & Joint Care: Stay Active', expert: 'Dr. Rajeev Singh', specialty: 'Orthopedics', duration: '16:40', views: 33000 },
    { title: 'Respiratory Health: Breathing Better', expert: 'Dr. Bharat Agrawal', specialty: 'Pulmonology', duration: '19:25', views: 27000 },
    { title: 'Child Care: First Year Essentials', expert: 'Dr. Sudesh Phanse', specialty: 'Pediatrics', duration: '28:15', views: 60000 },
  ];
  
  return videos.map((v, i) => ({
    id: `video_${i + 1}`,
    title: v.title,
    expert: v.expert,
    specialty: v.specialty,
    duration: v.duration,
    views: v.views,
    thumbnail: `https://images.unsplash.com/photo-${['1576091160550-2183fbdfa83e', '1587351021759-3e566b6af7cc', '1586773860418-d37222d8fce3', '1551076805-e1869033e490'][i % 4]}?w=800`,
    url: '#',
    featured: i < 4,
  }));
}

export async function GET() {
  const blogs = generateBlogPosts();
  const videos = generateVideos();
  
  return NextResponse.json({
    blogs,
    videos,
    stats: {
      totalArticles: blogs.length,
      totalVideos: videos.length,
    }
  });
}