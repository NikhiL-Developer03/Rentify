import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Users, 
  Car, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle,
  Award,
  Smile,
  Shield,
  ThumbsUp,
  ArrowRight
} from 'lucide-react';

const About = () => {
  const stats = [
    { label: 'Happy Customers', value: '10,000+', icon: Users },
    { label: 'Vehicles in Fleet', value: '250+', icon: Car },
    { label: 'Cities Covered', value: '50+', icon: MapPin },
    { label: 'Bookings Completed', value: '25,000+', icon: Calendar }
  ];

  const values = [
    {
      icon: Star,
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our service.',
      color: 'text-yellow-500 bg-yellow-100'
    },
    {
      icon: Shield,
      title: 'Safety',
      description: 'Your safety is our top priority with well-maintained vehicles.',
      color: 'text-green-500 bg-green-100'
    },
    {
      icon: Clock,
      title: 'Reliability',
      description: 'Count on us for timely service and dependable vehicles.',
      color: 'text-blue-500 bg-blue-100'
    },
    {
      icon: ThumbsUp,
      title: 'Customer First',
      description: 'Your satisfaction drives everything we do.',
      color: 'text-purple-500 bg-purple-100'
    }
  ];

  const timeline = [
    {
      year: '2010',
      title: 'Founded in Mumbai',
      description: 'Started with a small fleet of 10 vehicles in one location.'
    },
    {
      year: '2015',
      title: 'Expanded to 10 Cities',
      description: 'Rapid growth across major metropolitan areas in India.'
    },
    {
      year: '2020',
      title: 'Launched Premium Fleet',
      description: 'Introduced luxury vehicle options and corporate services.'
    },
    {
      year: '2025',
      title: 'Digital Transformation',
      description: 'Launched our seamless online booking platform with instant confirmations.'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-6">About Rentify</h1>
            <p className="text-xl text-gray-300 mb-8">
              India's leading car rental service, providing premium vehicles and exceptional service since 2010.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
            <div className="prose max-w-none">
              <p className="text-lg mb-4">
                Rentify was founded in 2010 with a simple mission: to revolutionize the car rental experience in India. What began as a small fleet of 10 vehicles in Mumbai has grown into a nationwide service with over 250 premium vehicles across 50+ cities.
              </p>
              <p className="text-lg mb-4">
                Our journey has been driven by a commitment to exceptional service, transparency in pricing, and a seamless booking experience. We understand that your time is valuable, which is why we've designed our processes to be efficient and customer-friendly.
              </p>
              <p className="text-lg mb-4">
                Whether you're a business traveler needing reliable transportation, a tourist exploring India's beautiful landscapes, or a local resident requiring a temporary vehicle, Rentify offers solutions tailored to your specific needs.
              </p>
              <p className="text-lg">
                Today, we continue to innovate and expand, bringing quality car rental services to more locations while maintaining the personalized touch that our customers have come to expect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-primary"></div>
              
              {/* Timeline items */}
              <div className="space-y-16">
                {timeline.map((item, index) => (
                  <div key={index} className={`flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} items-center`}>
                    <div className="md:w-1/2 mb-4 md:mb-0 px-4">
                      <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                      <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-bold z-10">
                        {item.year}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-full ${value.color} flex items-center justify-center mb-4`}>
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-lg text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Our Leadership Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                  <div className="bg-gray-300 w-full h-full flex items-center justify-center">
                    <Users className="h-16 w-16 text-gray-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">Raj Patel</h3>
                <p className="text-gray-600">Founder & CEO</p>
              </div>
              
              <div className="text-center">
                <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                  <div className="bg-gray-300 w-full h-full flex items-center justify-center">
                    <Users className="h-16 w-16 text-gray-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">Priya Sharma</h3>
                <p className="text-gray-600">COO</p>
              </div>
              
              <div className="text-center">
                <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                  <div className="bg-gray-300 w-full h-full flex items-center justify-center">
                    <Users className="h-16 w-16 text-gray-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">Vikram Singh</h3>
                <p className="text-gray-600">CTO</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjItMS44LTQtNC00cy00IDEuOC00IDQgMS44IDQgNCA0IDQtMS44IDQtNHptMC0zMGMwLTIuMi0xLjgtNC00LTRzLTQgMS44LTQgNCAxLjggNCA0IDQgNC0xLjggNC00em0wIDYwYzAtMi4yLTEuOC00LTQtNHMtNCAxLjgtNCA0IDEuOCA0IDQgNCA0LTEuOCA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">Ready to Experience Rentify?</h2>
            <p className="text-xl text-gray-200 mb-10">
              Join thousands of satisfied customers who choose Rentify for their car rental needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/cars">
                <Button variant="default" className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  Browse Our Fleet
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="ghost" className="text-lg px-8 py-6 border-2 border-white text-white hover:text-white hover:bg-white/10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
