import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    isSubmitted: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setFormStatus({ isSubmitting: true, isSubmitted: false, error: null });
    
    try {
      // Simulated form submission - in a real app, you would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setFormStatus({
        isSubmitting: false,
        isSubmitted: true,
        error: null
      });
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      toast.success('Your message has been sent successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormStatus({
        isSubmitting: false,
        isSubmitted: false,
        error: 'Failed to send your message. Please try again later.'
      });
      toast.error('Failed to send your message. Please try again later.');
    }
  };

  const locations = [
    {
      city: 'Mumbai (HQ)',
      address: '42 Nariman Point, Mumbai 400021',
      phone: '+91 22-4123-9876',
      email: 'mumbai@rentify.com',
      hours: 'Mon-Sat: 9am - 8pm, Sun: 10am - 6pm'
    },
    {
      city: 'Delhi',
      address: '15 Connaught Place, New Delhi 110001',
      phone: '+91 11-2876-5432',
      email: 'delhi@rentify.com',
      hours: 'Mon-Sat: 9am - 8pm, Sun: 10am - 6pm'
    },
    {
      city: 'Bangalore',
      address: '78 MG Road, Bangalore 560001',
      phone: '+91 80-4567-8910',
      email: 'bangalore@rentify.com',
      hours: 'Mon-Sat: 9am - 8pm, Sun: 10am - 6pm'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-6">Contact Us</h1>
            <p className="text-xl text-gray-300 mb-8">
              Have questions or need assistance? Our team is here to help you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="border-none shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Call Us</h3>
                <p className="text-gray-600">+91 22-4123-9876</p>
                <p className="text-gray-600">+91 98765-43210</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                <p className="text-gray-600">support@rentify.com</p>
                <p className="text-gray-600">info@rentify.com</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
                <p className="text-gray-600">42 Nariman Point</p>
                <p className="text-gray-600">Mumbai 400021, India</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
                <p className="text-gray-600">Mon-Sat: 9am - 8pm</p>
                <p className="text-gray-600">Sun: 10am - 6pm</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <MessageSquare className="mr-2 h-6 w-6" />
                    Send us a Message
                  </h2>

                  {formStatus.isSubmitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
                      <p className="text-green-700 mb-4">
                        Thank you for reaching out. Our team will get back to you shortly.
                      </p>
                      <Button onClick={() => setFormStatus(prev => ({ ...prev, isSubmitted: false }))}>
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Subject of your message"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="How can we help you?"
                          className="w-full min-h-[150px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>

                      {formStatus.error && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-md flex items-start">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                          <p className="text-sm text-red-700">{formStatus.error}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto"
                        disabled={formStatus.isSubmitting}
                      >
                        {formStatus.isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Map and Locations */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-lg mb-8">
                <CardContent className="p-0">
                  <div className="aspect-video w-full bg-gray-200 flex items-center justify-center">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3774.217484869228!2d72.82229851539224!3d18.927412661702916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7d1e0f7a1a001%3A0x15d577981ccb2e54!2sNariman%20Point%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1633087455225!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      title="Rentify Headquarters"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>

              {/* Location Selector */}
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Our Offices</h3>
                  <div className="space-y-4">
                    {locations.map((location, index) => (
                      <div key={index} className={index !== locations.length - 1 ? "pb-4 border-b" : ""}>
                        <h4 className="font-semibold text-primary">{location.city}</h4>
                        <p className="text-sm text-gray-600 mb-1">{location.address}</p>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Phone className="h-3 w-3 mr-2" />
                          {location.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Mail className="h-3 w-3 mr-2" />
                          {location.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-3 w-3 mr-2" />
                          {location.hours}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">How do I make a booking?</h3>
                <p className="text-gray-600">
                  You can easily book a car through our website or mobile app. Simply select your location, dates, and preferred vehicle, then complete the booking process online.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-xl font-semibold mb-2">What documents do I need for renting a car?</h3>
                <p className="text-gray-600">
                  You'll need a valid driver's license, a government-issued ID proof, and a credit/debit card for the security deposit. International customers will need a passport and an international driving permit.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Is there a security deposit?</h3>
                <p className="text-gray-600">
                  Yes, we require a refundable security deposit that varies based on the vehicle category. The deposit is released after the vehicle is returned in good condition.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Can I extend my rental period?</h3>
                <p className="text-gray-600">
                  Yes, you can extend your rental period by contacting our customer service at least 24 hours before your scheduled return time, subject to vehicle availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Stay Updated</h2>
            <p className="text-xl text-white/80 mb-8">
              Subscribe to our newsletter for exclusive offers and updates.
            </p>
            
            <div className="flex flex-col md:flex-row gap-3 max-w-lg mx-auto">
              <Input 
                placeholder="Your email address" 
                className="bg-white/10 text-white border-white/20 placeholder:text-white/60"
              />
              <Button variant="secondary" className="whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
