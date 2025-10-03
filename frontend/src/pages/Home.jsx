import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import heroImage from '@/assets/image 23.png';
import carImage from '@/assets/image 35.png';
import { 
  Car, 
  Shield, 
  Clock, 
  Star, 
  Users, 
  MapPin, 
  Zap, 
  CheckCircle,
  ArrowRight,
  Calendar,
  SmilePlus
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Car,
      title: 'Premium Fleet',
      description: 'Choose from 250+ luxury and economy vehicles',
      color: 'text-blue-600'
    },
    {
      icon: Shield,
      title: '24/7 Support',
      description: 'Round-the-clock customer service and roadside assistance',
      color: 'text-green-600'
    },
    {
      icon: Clock,
      title: 'Instant Booking',
      description: 'Book your car in seconds with our streamlined process',
      color: 'text-purple-600'
    },
    {
      icon: Star,
      title: 'Top Rated',
      description: '4.9/5 rating from 10,000+ satisfied customers',
      color: 'text-yellow-600'
    }
  ];

  const stats = [
    { label: 'Happy Customers', value: '10K+', icon: Users },
    { label: 'Luxury Vehicles', value: '250+', icon: Car },
    { label: 'Cities', value: '50+', icon: MapPin },
    { label: 'Years Experience', value: '15+', icon: Shield }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 min-h-[90vh] bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center min-h-[60vh]">
            {/* Left Content */}
            <div className="text-left px-8 py-12">
              <Badge variant="secondary" className="mb-4 bg-white text-black">
                <Zap className="h-4 w-4 mr-2" />
                Next-gen Fleet. Instant Drive.
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Rent Your Dream Car
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-xl">
                Transparent pricing. Premium vehicles. Book in seconds. 
                Experience the future of car rental with Rentify.
              </p>
              
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <Link to="/cars">
                    <Button 
                      size="lg" 
                      className="text-lg px-8 py-3 bg-white text-black hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 font-semibold"
                    >
                      Browse Cars
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/bookings">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg px-8 py-3 border-2 border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm"
                    >
                      My Bookings
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <Link to="/register">
                    <Button 
                      size="lg" 
                      className="text-lg px-8 py-3 bg-white text-black hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 font-semibold"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg px-8 py-3 border-2 border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Right Image - Full Right Side */}
            <div className="lg:absolute lg:right-0 lg:top-0 lg:h-full lg:w-1/2">
              <img 
                src={heroImage} 
                alt="Premium Car" 
                className="w-full h-full min-h-[60vh] lg:min-h-[80vh] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose Rentify?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience premium car rental with features designed for your convenience and peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg bg-background/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full bg-muted`}>
                        <Icon className={`h-8 w-8 ${feature.color}`} />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

     
      {/* How it Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-black">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Renting a luxury car has never been easier. Our streamlined process makes it simple for you
              to book and confirm your vehicle of choice online
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Car className="h-6 w-6 text-black" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-black">Browse and select</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Choose from our wide range of premium cars, select the pickup and return dates and locations that suit you best.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Calendar className="h-6 w-6 text-black" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-black">Book and confirm</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Book your desired car with just a few clicks and receive an instant confirmation via email or SMS.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <SmilePlus className="h-6 w-6 text-black" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-black">Enjoy your ride</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Pick up your car at the designated location and enjoy your premium driving experience with our top-quality service.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src={carImage} 
                  alt="Premium Car Process" 
                  className="w-full max-w-lg h-auto object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Ready for Your Premium Experience?
          </h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have experienced our premium fleet and exceptional service.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to={isAuthenticated ? "/cars" : "/register"}>
              <Button 
                size="lg" 
                className="text-lg px-10 py-4 bg-white text-black hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 font-semibold"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {isAuthenticated ? "Browse Cars" : "Start Your Journey"}
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 py-4 border-2 border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 backdrop-blur-sm"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Home;