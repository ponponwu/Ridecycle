
import React from 'react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  avatar: string;
  quote: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Alex Johnson',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
    quote: "Pedal Palace made it incredibly easy to sell my mountain bike. I had multiple inquiries within days and completed the sale in less than a week!",
    role: 'Mountain Bike Enthusiast'
  },
  {
    id: 2,
    name: 'Sarah Miller',
    location: 'Portland, OR',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
    quote: "I found my dream road bike at a great price. The detailed listing and high-quality photos helped me make my decision with confidence.",
    role: 'Road Cyclist'
  },
  {
    id: 3,
    name: 'Miguel Rodriguez',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
    quote: "The messaging system made it easy to ask questions about the bike before meeting up. Everything was as described, and the transaction was smooth.",
    role: 'Commuter'
  }
];

const TestimonialSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            What Our Users Say
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join thousands of cyclists who have successfully bought and sold bikes on our platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
              <blockquote className="text-gray-700 mb-4">
                "{testimonial.quote}"
              </blockquote>
              <p className="text-sm text-gray-500 font-medium">
                {testimonial.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
